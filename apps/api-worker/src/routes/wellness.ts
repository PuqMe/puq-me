import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";
import { BadRequestError, NotFoundError } from "../lib/errors.js";

const wellness = new Hono<AppContext>();

wellness.use("/*", auth);

// GET /v1/wellness/calm - get calm mode settings
wellness.get("/calm", async (c) => {
  const userId = c.get("userId");

  let settings = await c.env.DB.prepare(`
    SELECT user_id, daily_limit_enabled, daily_limit_encounters,
           night_mode_enabled, night_mode_start, night_mode_end,
           weekly_report_enabled, updated_at
    FROM calm_mode_settings
    WHERE user_id = ?
    LIMIT 1
  `)
    .bind(userId)
    .first();

  if (!settings) {
    const result = await c.env.DB.prepare(`
      INSERT INTO calm_mode_settings (user_id, updated_at)
      VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      RETURNING user_id, daily_limit_enabled, daily_limit_encounters,
                night_mode_enabled, night_mode_start, night_mode_end,
                weekly_report_enabled, updated_at
    `)
      .bind(userId)
      .first();
    settings = result;
  }

  return c.json({
    userId: String(userId),
    dailyLimitEnabled: Boolean((settings as any).daily_limit_enabled),
    dailyLimitEncounters: Number((settings as any).daily_limit_encounters),
    nightModeEnabled: Boolean((settings as any).night_mode_enabled),
    nightModeStart: (settings as any).night_mode_start,
    nightModeEnd: (settings as any).night_mode_end,
    weeklyReportEnabled: Boolean((settings as any).weekly_report_enabled),
    updatedAt: (settings as any).updated_at
  });
});

// PUT /v1/wellness/calm - update calm settings
wellness.put("/calm", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];

  if (body.dailyLimitEnabled !== undefined) {
    updates.push("daily_limit_enabled = ?");
    values.push(body.dailyLimitEnabled ? 1 : 0);
  }
  if (body.dailyLimitEncounters !== undefined) {
    updates.push("daily_limit_encounters = ?");
    values.push(Math.max(1, Math.min(100, body.dailyLimitEncounters)));
  }
  if (body.nightModeEnabled !== undefined) {
    updates.push("night_mode_enabled = ?");
    values.push(body.nightModeEnabled ? 1 : 0);
  }
  if (body.nightModeStart !== undefined) {
    updates.push("night_mode_start = ?");
    values.push(body.nightModeStart);
  }
  if (body.nightModeEnd !== undefined) {
    updates.push("night_mode_end = ?");
    values.push(body.nightModeEnd);
  }
  if (body.weeklyReportEnabled !== undefined) {
    updates.push("weekly_report_enabled = ?");
    values.push(body.weeklyReportEnabled ? 1 : 0);
  }

  if (updates.length === 0) {
    throw new BadRequestError("no_updates_provided");
  }

  updates.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");

  await c.env.DB.prepare(`
    INSERT INTO calm_mode_settings (user_id, updated_at)
    VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    ON CONFLICT (user_id) DO UPDATE SET
      ${updates.join(", ")}
  `)
    .bind(userId, ...values)
    .run();

  return c.json({ message: "calm_settings_updated" });
});

// GET /v1/wellness/stats - get daily/weekly stats
wellness.get("/stats", async (c) => {
  const userId = c.get("userId");
  const timeframe = c.req.query("timeframe") ?? "daily";

  let dateFilter: string;
  let label: string;

  if (timeframe === "weekly") {
    dateFilter = "date('now', '-7 days')";
    label = "weekly";
  } else {
    dateFilter = "date('now', '-1 day')";
    label = "daily";
  }

  const stats = await c.env.DB.prepare(`
    SELECT
      SUM(encounters_count) as total_encounters,
      SUM(conversations_count) as total_conversations,
      SUM(minutes_active) as total_minutes_active,
      COUNT(*) as active_days
    FROM calm_mode_stats
    WHERE user_id = ? AND date >= ${dateFilter}
  `)
    .bind(userId)
    .first();

  return c.json({
    userId: String(userId),
    timeframe: label,
    stats: {
      activeDays: Number((stats as any).active_days) || 0,
      totalEncounters: Number((stats as any).total_encounters) || 0,
      totalConversations: Number((stats as any).total_conversations) || 0,
      totalMinutesActive: Number((stats as any).total_minutes_active) || 0
    }
  });
});

// GET /v1/wellness/auto-vanish - get auto-vanish settings
wellness.get("/auto-vanish", async (c) => {
  const userId = c.get("userId");

  let settings = await c.env.DB.prepare(`
    SELECT user_id, profile_visible, profile_expires_at, intent_expires_at,
           card_expires_at, next_activation_at, updated_at
    FROM auto_vanish_settings
    WHERE user_id = ?
    LIMIT 1
  `)
    .bind(userId)
    .first();

  if (!settings) {
    const result = await c.env.DB.prepare(`
      INSERT INTO auto_vanish_settings (user_id, updated_at)
      VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      RETURNING user_id, profile_visible, profile_expires_at, intent_expires_at,
                card_expires_at, next_activation_at, updated_at
    `)
      .bind(userId)
      .first();
    settings = result;
  }

  return c.json({
    userId: String(userId),
    profileVisible: Boolean((settings as any).profile_visible),
    profileExpiresAt: (settings as any).profile_expires_at ?? null,
    intentExpiresAt: (settings as any).intent_expires_at ?? null,
    cardExpiresAt: (settings as any).card_expires_at ?? null,
    nextActivationAt: (settings as any).next_activation_at ?? null,
    updatedAt: (settings as any).updated_at
  });
});

// PUT /v1/wellness/auto-vanish - update auto-vanish settings
wellness.put("/auto-vanish", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];

  if (body.profileVisible !== undefined) {
    updates.push("profile_visible = ?");
    values.push(body.profileVisible ? 1 : 0);
  }
  if (body.profileExpiresAt !== undefined) {
    updates.push("profile_expires_at = ?");
    values.push(body.profileExpiresAt);
  }
  if (body.intentExpiresAt !== undefined) {
    updates.push("intent_expires_at = ?");
    values.push(body.intentExpiresAt);
  }
  if (body.cardExpiresAt !== undefined) {
    updates.push("card_expires_at = ?");
    values.push(body.cardExpiresAt);
  }
  if (body.nextActivationAt !== undefined) {
    updates.push("next_activation_at = ?");
    values.push(body.nextActivationAt);
  }

  if (updates.length === 0) {
    throw new BadRequestError("no_updates_provided");
  }

  updates.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");

  await c.env.DB.prepare(`
    INSERT INTO auto_vanish_settings (user_id, updated_at)
    VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    ON CONFLICT (user_id) DO UPDATE SET
      ${updates.join(", ")}
  `)
    .bind(userId, ...values)
    .run();

  return c.json({ message: "auto_vanish_settings_updated" });
});

export default wellness;
