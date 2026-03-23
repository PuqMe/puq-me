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
    SELECT id, user_id, calm_mode_enabled, do_not_disturb_until, created_at, updated_at
    FROM wellness_settings
    WHERE user_id = ?
    LIMIT 1
  `)
    .bind(userId)
    .first();

  if (!settings) {
    // Create default settings if they don't exist
    const result = await c.env.DB.prepare(`
      INSERT INTO wellness_settings (user_id, calm_mode_enabled, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
      RETURNING id, user_id, calm_mode_enabled, do_not_disturb_until, created_at, updated_at
    `)
      .bind(userId, 0)
      .first();
    settings = result;
  }

  return c.json({
    userId: String(userId),
    calmModeEnabled: Boolean((settings as any).calm_mode_enabled),
    doNotDisturbUntil: (settings as any).do_not_disturb_until ?? null,
    createdAt: (settings as any).created_at,
    updatedAt: (settings as any).updated_at
  });
});

// PUT /v1/wellness/calm - update calm settings
wellness.put("/calm", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];

  if (body.calmModeEnabled !== undefined) {
    updates.push("calm_mode_enabled = ?");
    values.push(body.calmModeEnabled ? 1 : 0);
  }
  if (body.doNotDisturbUntil !== undefined) {
    updates.push("do_not_disturb_until = ?");
    values.push(body.doNotDisturbUntil);
  }

  if (updates.length === 0) {
    throw new BadRequestError("no_updates_provided");
  }

  updates.push("updated_at = datetime('now')");
  values.push(userId);

  await c.env.DB.prepare(`
    INSERT INTO wellness_settings (user_id, calm_mode_enabled, do_not_disturb_until, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT (user_id) DO UPDATE SET
      ${updates.join(", ")}
  `)
    .bind(
      userId,
      body.calmModeEnabled !== undefined ? (body.calmModeEnabled ? 1 : 0) : 0,
      body.doNotDisturbUntil ?? null,
      ...values
    )
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
    dateFilter = "datetime('now', '-7 days')";
    label = "weekly";
  } else {
    dateFilter = "datetime('now', '-1 day')";
    label = "daily";
  }

  const stats = await c.env.DB.prepare(`
    SELECT
      COUNT(DISTINCT DATE(created_at)) as active_days,
      COUNT(*) as total_interactions,
      AVG(CAST(duration_minutes AS FLOAT)) as avg_session_duration,
      MAX(created_at) as last_active
    FROM wellness_stats
    WHERE user_id = ? AND created_at > ${dateFilter}
  `)
    .bind(userId)
    .first();

  const focusScore = await c.env.DB.prepare(`
    SELECT
      SUM(focus_score) as total_focus_score,
      COUNT(*) as focus_events
    FROM wellness_events
    WHERE user_id = ? AND created_at > ${dateFilter}
  `)
    .bind(userId)
    .first();

  return c.json({
    userId: String(userId),
    timeframe: label,
    stats: {
      activeDays: Number((stats as any).active_days) || 0,
      totalInteractions: Number((stats as any).total_interactions) || 0,
      avgSessionDuration: (stats as any).avg_session_duration
        ? Math.round((stats as any).avg_session_duration)
        : 0,
      lastActive: (stats as any).last_active ?? null,
      focusScore: Number((focusScore as any).total_focus_score) || 0,
      focusEvents: Number((focusScore as any).focus_events) || 0
    }
  });
});

// GET /v1/wellness/auto-vanish - get auto-vanish settings
wellness.get("/auto-vanish", async (c) => {
  const userId = c.get("userId");

  let settings = await c.env.DB.prepare(`
    SELECT id, user_id, auto_vanish_enabled, vanish_after_minutes, created_at, updated_at
    FROM auto_vanish_settings
    WHERE user_id = ?
    LIMIT 1
  `)
    .bind(userId)
    .first();

  if (!settings) {
    // Create default settings if they don't exist
    const result = await c.env.DB.prepare(`
      INSERT INTO auto_vanish_settings (user_id, auto_vanish_enabled, vanish_after_minutes, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
      RETURNING id, user_id, auto_vanish_enabled, vanish_after_minutes, created_at, updated_at
    `)
      .bind(userId, 1, 60)
      .first();
    settings = result;
  }

  return c.json({
    userId: String(userId),
    autoVanishEnabled: Boolean((settings as any).auto_vanish_enabled),
    vanishAfterMinutes: Number((settings as any).vanish_after_minutes),
    createdAt: (settings as any).created_at,
    updatedAt: (settings as any).updated_at
  });
});

// PUT /v1/wellness/auto-vanish - update auto-vanish settings
wellness.put("/auto-vanish", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];

  if (body.autoVanishEnabled !== undefined) {
    updates.push("auto_vanish_enabled = ?");
    values.push(body.autoVanishEnabled ? 1 : 0);
  }
  if (body.vanishAfterMinutes !== undefined) {
    updates.push("vanish_after_minutes = ?");
    values.push(Math.max(5, Math.min(1440, body.vanishAfterMinutes)));
  }

  if (updates.length === 0) {
    throw new BadRequestError("no_updates_provided");
  }

  updates.push("updated_at = datetime('now')");
  values.push(userId);

  await c.env.DB.prepare(`
    INSERT INTO auto_vanish_settings (user_id, auto_vanish_enabled, vanish_after_minutes, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT (user_id) DO UPDATE SET
      ${updates.join(", ")}
  `)
    .bind(
      userId,
      body.autoVanishEnabled !== undefined ? (body.autoVanishEnabled ? 1 : 0) : 1,
      body.vanishAfterMinutes ?? 60,
      ...values
    )
    .run();

  return c.json({ message: "auto_vanish_settings_updated" });
});

export default wellness;
