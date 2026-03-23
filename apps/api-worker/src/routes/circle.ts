import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";

const circle = new Hono<AppContext>();

circle.use("/*", auth);

// GET /v1/circle - get circle overview (encounters + groups summary)
circle.get("/", async (c) => {
  const userId = c.get("userId");

  const encounters = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM encounters WHERE user_id = ?
  `)
    .bind(userId)
    .first();

  const recentEncounters = await c.env.DB.prepare(`
    SELECT
      e.id, e.encountered_user_id, e.distance_meters, e.encounter_count,
      e.first_seen_at, e.last_seen_at,
      p.display_name
    FROM encounters e
    LEFT JOIN profiles p ON p.user_id = e.encountered_user_id
    WHERE e.user_id = ?
    ORDER BY e.last_seen_at DESC
    LIMIT 10
  `)
    .bind(userId)
    .all();

  return c.json({
    encounters: {
      total: Number((encounters as any).count) || 0,
      recent: (recentEncounters.results ?? []).map((item: any) => ({
        id: String(item.id),
        encounteredUserId: String(item.encountered_user_id),
        displayName: item.display_name ?? null,
        distanceMeters: item.distance_meters ? Number(item.distance_meters) : null,
        encounterCount: Number(item.encounter_count),
        firstSeenAt: item.first_seen_at,
        lastSeenAt: item.last_seen_at
      }))
    },
    meta: { userId: String(userId) }
  });
});

// GET /v1/circle/encounters?window=24h|3m
circle.get("/encounters", async (c) => {
  const userId = c.get("userId");
  const window = c.req.query("window") ?? "24h";

  // Determine time window
  let timeFilter: string;
  if (window === "3m" || window === "3mo") {
    timeFilter = "datetime('now', '-3 months')";
  } else if (window === "7d") {
    timeFilter = "datetime('now', '-7 days')";
  } else {
    // Default 24h
    timeFilter = "datetime('now', '-1 day')";
  }

  // For now, return empty encounters (no encounter tracking table yet)
  // This prevents the 404 error and allows the frontend to render
  return c.json({
    items: [],
    meta: {
      window,
      totalEncounters: 0,
      userId: String(userId)
    }
  });
});

// GET /v1/circle/groups
circle.get("/groups", async (c) => {
  const userId = c.get("userId");

  // Return empty groups for now
  return c.json({
    groups: [],
    meta: {
      totalGroups: 0,
      userId: String(userId)
    }
  });
});

export default circle;
