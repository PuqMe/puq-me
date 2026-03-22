import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";
import { NotFoundError } from "../lib/errors.js";

const notifications = new Hono<AppContext>();

notifications.use("/*", auth);

// GET /v1/notifications
notifications.get("/", async (c) => {
  const userId = c.get("userId");
  const limit = parseInt(c.req.query("limit") ?? "20", 10);
  const cursor = c.req.query("cursor");

  let query: string;
  let binds: any[];

  if (cursor) {
    query = `
      SELECT id, type, channel, payload, status, priority, sent_at, read_at, created_at
      FROM notifications
      WHERE user_id = ? AND created_at < (SELECT created_at FROM notifications WHERE id = ?)
      ORDER BY created_at DESC
      LIMIT ?
    `;
    binds = [userId, cursor, limit + 1];
  } else {
    query = `
      SELECT id, type, channel, payload, status, priority, sent_at, read_at, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;
    binds = [userId, limit + 1];
  }

  const results = await c.env.DB.prepare(query).bind(...binds).all();
  const rows = results.results ?? [];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  return c.json({
    items: page.map((row: any) => ({
      id: String(row.id),
      type: row.type,
      channel: row.channel,
      payload: row.payload ? JSON.parse(row.payload) : {},
      status: row.status,
      priority: row.priority,
      sentAt: row.sent_at,
      readAt: row.read_at,
      createdAt: row.created_at
    })),
    meta: {
      hasMore,
      nextCursor: hasMore && page.length > 0 ? String((page[page.length - 1] as any).id) : null
    }
  });
});

// POST /v1/notifications/:notificationId/read
notifications.post("/:notificationId/read", async (c) => {
  const userId = c.get("userId");
  const notificationId = c.req.param("notificationId");

  const result = await c.env.DB.prepare(`
    UPDATE notifications SET read_at = datetime('now'), status = 'read', updated_at = datetime('now')
    WHERE id = ? AND user_id = ? AND read_at IS NULL
  `).bind(notificationId, userId).run();

  if ((result.meta?.changes ?? 0) === 0) {
    throw new NotFoundError("notification_not_found");
  }

  return c.json({ message: "notification_read" });
});

// GET /v1/notifications/devices
notifications.get("/devices", async (c) => {
  const userId = c.get("userId");

  const results = await c.env.DB.prepare(`
    SELECT id, platform, provider, token, endpoint, is_active, last_seen_at, created_at
    FROM notification_devices
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).bind(userId).all();

  return c.json({
    items: (results.results ?? []).map((d: any) => ({
      id: String(d.id),
      platform: d.platform,
      provider: d.provider,
      token: d.token,
      endpoint: d.endpoint,
      isActive: Boolean(d.is_active),
      lastSeenAt: d.last_seen_at,
      createdAt: d.created_at
    }))
  });
});

// POST /v1/notifications/devices
notifications.post("/devices", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const result = await c.env.DB.prepare(`
    INSERT INTO notification_devices (user_id, platform, provider, token, endpoint, p256dh, auth_secret, user_agent, locale)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (provider, token)
    DO UPDATE SET
      user_id = excluded.user_id,
      is_active = 1,
      last_seen_at = datetime('now'),
      updated_at = datetime('now')
    RETURNING id
  `).bind(
    userId,
    body.platform,
    body.provider,
    body.token,
    body.endpoint ?? null,
    body.p256dh ?? null,
    body.authSecret ?? null,
    body.userAgent ?? null,
    body.locale ?? null
  ).first<{ id: number }>();

  return c.json({ deviceId: String(result?.id) }, 201);
});

// DELETE /v1/notifications/devices/:deviceId
notifications.delete("/devices/:deviceId", async (c) => {
  const userId = c.get("userId");
  const deviceId = c.req.param("deviceId");

  await c.env.DB.prepare(
    `UPDATE notification_devices SET is_active = 0, updated_at = datetime('now') WHERE id = ? AND user_id = ?`
  ).bind(deviceId, userId).run();

  return c.json({ message: "device_deactivated" });
});

// GET /v1/notifications/preferences
notifications.get("/preferences", async (c) => {
  const userId = c.get("userId");

  const prefs = await c.env.DB.prepare(
    `SELECT * FROM notification_preferences WHERE user_id = ? LIMIT 1`
  ).bind(userId).first();

  if (!prefs) {
    return c.json({
      newMatch: true, newMessage: true, messageReminder: true,
      profileApproved: true, safetyWarning: true, productUpdates: false,
      quietHoursEnabled: false, quietHoursStart: null, quietHoursEnd: null
    });
  }

  return c.json({
    newMatch: Boolean(prefs.new_match),
    newMessage: Boolean(prefs.new_message),
    messageReminder: Boolean(prefs.message_reminder),
    profileApproved: Boolean(prefs.profile_approved),
    safetyWarning: Boolean(prefs.safety_warning),
    productUpdates: Boolean(prefs.product_updates),
    quietHoursEnabled: Boolean(prefs.quiet_hours_enabled),
    quietHoursStart: prefs.quiet_hours_start,
    quietHoursEnd: prefs.quiet_hours_end
  });
});

// PUT /v1/notifications/preferences
notifications.put("/preferences", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  await c.env.DB.prepare(`
    INSERT INTO notification_preferences (user_id, new_match, new_message, message_reminder, profile_approved, safety_warning, product_updates, quiet_hours_enabled, quiet_hours_start, quiet_hours_end)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (user_id) DO UPDATE SET
      new_match = excluded.new_match,
      new_message = excluded.new_message,
      message_reminder = excluded.message_reminder,
      profile_approved = excluded.profile_approved,
      safety_warning = excluded.safety_warning,
      product_updates = excluded.product_updates,
      quiet_hours_enabled = excluded.quiet_hours_enabled,
      quiet_hours_start = excluded.quiet_hours_start,
      quiet_hours_end = excluded.quiet_hours_end,
      updated_at = datetime('now')
  `).bind(
    userId,
    body.newMatch ? 1 : 0,
    body.newMessage ? 1 : 0,
    body.messageReminder ? 1 : 0,
    body.profileApproved ? 1 : 0,
    body.safetyWarning ? 1 : 0,
    body.productUpdates ? 1 : 0,
    body.quietHoursEnabled ? 1 : 0,
    body.quietHoursStart ?? null,
    body.quietHoursEnd ?? null
  ).run();

  return c.json({ message: "preferences_updated" });
});

export default notifications;
