import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";
import { BadRequestError, NotFoundError } from "../lib/errors.js";

const intents = new Hono<AppContext>();

intents.use("/*", auth);

// GET /v1/intents - list active intents nearby
intents.get("/", async (c) => {
  const userId = c.get("userId");
  const latitude = c.req.query("latitude");
  const longitude = c.req.query("longitude");
  const radiusKm = c.req.query("radius_km") ?? "10";

  if (!latitude || !longitude) {
    throw new BadRequestError("latitude_and_longitude_required");
  }

  const items = await c.env.DB.prepare(`
    SELECT
      id, user_id, category, note, duration_hours, latitude, longitude,
      created_at, expires_at
    FROM intents
    WHERE deleted_at IS NULL
      AND expires_at > datetime('now')
      AND (
        6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(latitude))
        )
      ) <= ?
    ORDER BY created_at DESC
    LIMIT 100
  `)
    .bind(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(latitude),
      parseFloat(radiusKm)
    )
    .all();

  return c.json({
    items: (items.results ?? []).map((item: any) => ({
      id: String(item.id),
      userId: String(item.user_id),
      category: item.category,
      note: item.note,
      durationHours: Number(item.duration_hours),
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      createdAt: item.created_at,
      expiresAt: item.expires_at
    })),
    meta: {
      totalCount: (items.results ?? []).length,
      userLocation: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
    }
  });
});

// POST /v1/intents - create new intent
intents.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  if (!body.category || !body.latitude || !body.longitude) {
    throw new BadRequestError("category_latitude_longitude_required");
  }

  const durationHours = body.duration_hours ?? 24;
  const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

  const result = await c.env.DB.prepare(`
    INSERT INTO intents (user_id, category, note, duration_hours, latitude, longitude, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    RETURNING id
  `)
    .bind(userId, body.category, body.note ?? null, durationHours, body.latitude, body.longitude, expiresAt)
    .first();

  return c.json(
    {
      id: String((result as any).id),
      userId: String(userId),
      category: body.category,
      note: body.note ?? null,
      durationHours,
      latitude: body.latitude,
      longitude: body.longitude,
      expiresAt
    },
    { status: 201 }
  );
});

// GET /v1/intents/mine - get user's active intents
intents.get("/mine", async (c) => {
  const userId = c.get("userId");

  const items = await c.env.DB.prepare(`
    SELECT
      id, user_id, category, note, duration_hours, latitude, longitude,
      created_at, expires_at
    FROM intents
    WHERE user_id = ? AND deleted_at IS NULL AND expires_at > datetime('now')
    ORDER BY created_at DESC
  `)
    .bind(userId)
    .all();

  return c.json({
    items: (items.results ?? []).map((item: any) => ({
      id: String(item.id),
      userId: String(item.user_id),
      category: item.category,
      note: item.note,
      durationHours: Number(item.duration_hours),
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      createdAt: item.created_at,
      expiresAt: item.expires_at
    })),
    meta: { totalCount: (items.results ?? []).length }
  });
});

// DELETE /v1/intents/:id - deactivate intent
intents.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const intentId = c.req.param("id");

  const intent = await c.env.DB.prepare(`
    SELECT id, user_id FROM intents WHERE id = ? AND user_id = ?
  `)
    .bind(intentId, userId)
    .first();

  if (!intent) {
    throw new NotFoundError("intent_not_found");
  }

  await c.env.DB.prepare(`
    UPDATE intents SET deleted_at = datetime('now') WHERE id = ?
  `)
    .bind(intentId)
    .run();

  return c.json({ message: "intent_deactivated" });
});

export default intents;
