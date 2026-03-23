import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";
import { BadRequestError, NotFoundError } from "../lib/errors.js";

const buzz = new Hono<AppContext>();

buzz.use("/*", auth);

// GET /v1/buzz/settings - get buzz settings
buzz.get("/settings", async (c) => {
  const userId = c.get("userId");

  let settings = await c.env.DB.prepare(`
    SELECT user_id, vibration_enabled, buzz_radius_meters, only_matching_intents, updated_at
    FROM buzz_settings
    WHERE user_id = ?
    LIMIT 1
  `)
    .bind(userId)
    .first();

  if (!settings) {
    // Create default settings if they don't exist
    const result = await c.env.DB.prepare(`
      INSERT INTO buzz_settings (user_id, vibration_enabled, buzz_radius_meters, updated_at)
      VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      RETURNING user_id, vibration_enabled, buzz_radius_meters, only_matching_intents, updated_at
    `)
      .bind(userId, 1, 200)
      .first();
    settings = result;
  }

  return c.json({
    userId: String(userId),
    vibrationEnabled: Boolean((settings as any).vibration_enabled),
    buzzRadiusMeters: Number((settings as any).buzz_radius_meters),
    onlyMatchingIntents: Boolean((settings as any).only_matching_intents),
    updatedAt: (settings as any).updated_at
  });
});

// PUT /v1/buzz/settings - update buzz settings
buzz.put("/settings", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];

  if (body.vibrationEnabled !== undefined) {
    updates.push("vibration_enabled = ?");
    values.push(body.vibrationEnabled ? 1 : 0);
  }
  if (body.buzzRadiusMeters !== undefined) {
    updates.push("buzz_radius_meters = ?");
    values.push(Math.max(10, Math.min(1000, body.buzzRadiusMeters)));
  }

  if (updates.length === 0) {
    throw new BadRequestError("no_updates_provided");
  }

  updates.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");
  values.push(userId);

  await c.env.DB.prepare(`
    INSERT INTO buzz_settings (user_id, vibration_enabled, buzz_radius_meters, updated_at)
    VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    ON CONFLICT (user_id) DO UPDATE SET
      ${updates.join(", ")}
  `)
    .bind(
      userId,
      body.vibrationEnabled !== undefined ? (body.vibrationEnabled ? 1 : 0) : 1,
      body.buzzRadiusMeters ?? 200,
      ...values
    )
    .run();

  return c.json({ message: "buzz_settings_updated" });
});

// GET /v1/buzz/events - get recent buzz events
buzz.get("/events", async (c) => {
  const userId = c.get("userId");
  const limit = c.req.query("limit") ?? "50";

  const events = await c.env.DB.prepare(`
    SELECT
      id, user_id, triggered_by_user_id, action, distance_meters, created_at
    FROM buzz_events
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `)
    .bind(userId, parseInt(limit))
    .all();

  return c.json({
    items: (events.results ?? []).map((item: any) => ({
      id: String(item.id),
      userId: String(item.user_id),
      triggeredByUserId: String(item.triggered_by_user_id),
      action: item.action,
      distanceMeters: item.distance_meters ? Number(item.distance_meters) : null,
      createdAt: item.created_at
    })),
    meta: { totalCount: (events.results ?? []).length }
  });
});

// POST /v1/buzz/events/:id/action - wave or ignore
buzz.post("/events/:eventId/action", async (c) => {
  const userId = c.get("userId");
  const eventId = c.req.param("eventId");
  const body = await c.req.json();

  const action = body.action;
  if (!["wave", "ignore"].includes(action)) {
    throw new BadRequestError("invalid_action");
  }

  const event = await c.env.DB.prepare(`
    SELECT id, triggered_for_user_id FROM buzz_events WHERE id = ?
  `)
    .bind(eventId)
    .first();

  if (!event) {
    throw new NotFoundError("event_not_found");
  }

  if ((event as any).triggered_for_user_id !== userId) {
    throw new BadRequestError("not_authorized_for_event");
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO buzz_event_actions (event_id, user_id, action, created_at)
    VALUES (?, ?, ?, datetime('now'))
    RETURNING id
  `)
    .bind(eventId, userId, action)
    .first();

  return c.json(
    {
      id: String((result as any).id),
      eventId: String(eventId),
      userId: String(userId),
      action
    },
    { status: 201 }
  );
});

export default buzz;
