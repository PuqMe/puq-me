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
    SELECT user_id, mode, region_type, selected_friends, selected_group_id, scan_radius_km, updated_at
    FROM visibility_settings
    WHERE user_id = ?
    LIMIT 1
  `)
    .bind(userId)
    .first();

  if (!settings) {
    // Create default settings if they don't exist
    const result = await c.env.DB.prepare(`
      INSERT INTO visibility_settings (user_id, mode, scan_radius_km, updated_at)
      VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      RETURNING user_id, mode, region_type, selected_friends, selected_group_id, scan_radius_km, updated_at
    `)
      .bind(userId, "global", 5)
      .first();
    settings = result;
  }

  const selectedFriends = settings && (settings as any).selected_friends
    ? JSON.parse((settings as any).selected_friends)
    : [];

  return c.json({
    userId: String(userId),
    mode: (settings as any).mode,
    regionType: (settings as any).region_type ?? null,
    selectedFriends,
    selectedGroupId: (settings as any).selected_group_id ?? null,
    scanRadiusKm: Number((settings as any).scan_radius_km),
    updatedAt: (settings as any).updated_at
  });
});

// PUT /v1/visibility - update visibility mode and settings
visibility.put("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const validModes = ["global", "region", "phantom", "zero", "freunde", "nur_diese_freunde", "ausser_freunde", "gruppe"];
  if (body.mode && !validModes.includes(body.mode)) {
    throw new BadRequestError("invalid_visibility_mode");
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (body.mode !== undefined) {
    updates.push("mode = ?");
    values.push(body.mode);
  }
  if (body.scanRadiusKm !== undefined) {
    updates.push("scan_radius_km = ?");
    values.push(Math.max(1, Math.min(50, body.scanRadiusKm)));
  }
  if (body.regionType !== undefined) {
    updates.push("region_type = ?");
    values.push(body.regionType);
  }
  if (body.selectedFriends !== undefined) {
    updates.push("selected_friends = ?");
    values.push(JSON.stringify(Array.isArray(body.selectedFriends) ? body.selectedFriends : []));
  }
  if (body.selectedGroupId !== undefined) {
    updates.push("selected_group_id = ?");
    values.push(body.selectedGroupId);
  }

  if (updates.length === 0) {
    throw new BadRequestError("no_updates_provided");
  }

  updates.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");
  values.push(userId);

  await c.env.DB.prepare(`
    INSERT INTO visibility_settings (user_id, mode, scan_radius_km, updated_at)
    VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    ON CONFLICT (user_id) DO UPDATE SET
      ${updates.join(", ")}
  `)
    .bind(
      userId,
      body.mode ?? "global",
      body.scanRadiusKm ?? 5,
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
