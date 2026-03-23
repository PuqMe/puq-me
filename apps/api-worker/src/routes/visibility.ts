import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";
import { BadRequestError, NotFoundError } from "../lib/errors.js";

const visibility = new Hono<AppContext>();

visibility.use("/*", auth);

// GET /v1/visibility - get current visibility settings
visibility.get("/", async (c) => {
  const userId = c.get("userId");

  let settings = await c.env.DB.prepare(`
    SELECT id, user_id, mode, radius_meters, is_anonymous, hidden_from_ids, created_at, updated_at
    FROM visibility_settings
    WHERE user_id = ?
    LIMIT 1
  `)
    .bind(userId)
    .first();

  if (!settings) {
    // Create default settings if they don't exist
    const result = await c.env.DB.prepare(`
      INSERT INTO visibility_settings (user_id, mode, radius_meters, is_anonymous, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      RETURNING id, user_id, mode, radius_meters, is_anonymous, hidden_from_ids, created_at, updated_at
    `)
      .bind(userId, "visible", 500, 0)
      .first();
    settings = result;
  }

  const hiddenFromIds = settings && (settings as any).hidden_from_ids
    ? JSON.parse((settings as any).hidden_from_ids)
    : [];

  return c.json({
    userId: String(userId),
    mode: (settings as any).mode,
    radiusMeters: Number((settings as any).radius_meters),
    isAnonymous: Boolean((settings as any).is_anonymous),
    hiddenFromIds,
    createdAt: (settings as any).created_at,
    updatedAt: (settings as any).updated_at
  });
});

// PUT /v1/visibility - update visibility mode and settings
visibility.put("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const validModes = ["visible", "friends_only", "anonymous", "hidden"];
  if (body.mode && !validModes.includes(body.mode)) {
    throw new BadRequestError("invalid_visibility_mode");
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (body.mode !== undefined) {
    updates.push("mode = ?");
    values.push(body.mode);
  }
  if (body.radiusMeters !== undefined) {
    updates.push("radius_meters = ?");
    values.push(Math.max(100, Math.min(5000, body.radiusMeters)));
  }
  if (body.isAnonymous !== undefined) {
    updates.push("is_anonymous = ?");
    values.push(body.isAnonymous ? 1 : 0);
  }
  if (body.hiddenFromIds !== undefined) {
    updates.push("hidden_from_ids = ?");
    values.push(JSON.stringify(Array.isArray(body.hiddenFromIds) ? body.hiddenFromIds : []));
  }

  if (updates.length === 0) {
    throw new BadRequestError("no_updates_provided");
  }

  updates.push("updated_at = datetime('now')");
  values.push(userId);

  await c.env.DB.prepare(`
    INSERT INTO visibility_settings (user_id, mode, radius_meters, is_anonymous, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT (user_id) DO UPDATE SET
      ${updates.join(", ")}
  `)
    .bind(
      userId,
      body.mode ?? "visible",
      body.radiusMeters ?? 500,
      body.isAnonymous ? 1 : 0,
      ...values
    )
    .run();

  return c.json({ message: "visibility_updated" });
});

// GET /v1/visibility/modes - list available modes
visibility.get("/modes", async (c) => {
  return c.json({
    modes: [
      {
        id: "visible",
        name: "Fully Visible",
        description: "Everyone can see you on the map"
      },
      {
        id: "friends_only",
        name: "Friends Only",
        description: "Only your followers can see you"
      },
      {
        id: "anonymous",
        name: "Anonymous",
        description: "You appear as a ghost, no personal info visible"
      },
      {
        id: "hidden",
        name: "Hidden",
        description: "You cannot be seen by anyone"
      }
    ]
  });
});

export default visibility;
