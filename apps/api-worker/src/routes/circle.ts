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

// POST /v1/circle/location-events
// The web client posts the user's coarse location periodically.
// Persists into the `location_events` D1 table (migration 0004).
// Privacy: coarse-only (binned at >= 100m by clients, validated <= 25km),
// retained ≤ 30 days (cleanup job purges older rows).
circle.post("/location-events", async (c) => {
  const userId = c.get("userId");

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: { code: "bad_request", message: "invalid_json" } }, 400);
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  const lat = Number(payload.lat);
  const lon = Number(payload.lon);
  const accuracyMetersRaw = payload.accuracyMeters;
  const accuracyMeters =
    accuracyMetersRaw === undefined || accuracyMetersRaw === null
      ? 250
      : Number(accuracyMetersRaw);

  const valid =
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    Number.isFinite(lon) &&
    lon >= -180 &&
    lon <= 180 &&
    Number.isFinite(accuracyMeters) &&
    accuracyMeters > 0 &&
    accuracyMeters <= 25000;

  if (!valid) {
    return c.json(
      { error: { code: "validation_error", message: "lat/lon/accuracyMeters out of range" } },
      400
    );
  }

  // Optional client-supplied capture time. Accept ISO-8601 strings only.
  const capturedAtRaw = payload.capturedAt;
  let capturedAt: string | null = null;
  if (typeof capturedAtRaw === "string" && capturedAtRaw.length > 0) {
    const parsed = Date.parse(capturedAtRaw);
    if (Number.isFinite(parsed)) {
      capturedAt = new Date(parsed).toISOString();
    }
  }

  const serverNow = new Date().toISOString();

  // Round to ~100m grid before persisting (extra defense; client should already coarsen).
  // 1 degree latitude ≈ 111_320m. 100m -> 0.0009 deg.
  const COARSE_DEG = 0.001;
  const latCoarse = Math.round(lat / COARSE_DEG) * COARSE_DEG;
  const lonCoarse = Math.round(lon / COARSE_DEG) * COARSE_DEG;

  try {
    await c.env.DB.prepare(
      `INSERT INTO location_events
         (user_id, lat, lon, accuracy_meters, captured_at, server_received_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(userId, latCoarse, lonCoarse, accuracyMeters, capturedAt, serverNow)
      .run();
  } catch (err) {
    // Don't fail the client request if the DB blip — coarse location pings
    // are best-effort. But log so Sentry/Wrangler picks it up.
    console.error("location_events insert failed", err);
    return c.json(
      {
        stored: false,
        zoneLabel: "Grobe Begegnungszone empfangen",
        capturedAt: serverNow,
        meta: { userId: String(userId), persisted: false }
      },
      201
    );
  }

  return c.json(
    {
      stored: true,
      zoneLabel: "Grobe Begegnungszone gespeichert",
      capturedAt: serverNow,
      meta: { userId: String(userId), persisted: true }
    },
    201
  );
});

export default circle;
