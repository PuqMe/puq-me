import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";

const circle = new Hono<AppContext>();

circle.use("/*", auth);

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
