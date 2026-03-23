import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";
import { BadRequestError, NotFoundError } from "../lib/errors.js";

const microCards = new Hono<AppContext>();

microCards.use("/*", auth);

// GET /v1/micro-cards - list active micro cards nearby
microCards.get("/", async (c) => {
  const userId = c.get("userId");
  const latitude = c.req.query("latitude");
  const longitude = c.req.query("longitude");
  const radiusKm = c.req.query("radius_km") ?? "5";

  if (!latitude || !longitude) {
    throw new BadRequestError("latitude_and_longitude_required");
  }

  const items = await c.env.DB.prepare(`
    SELECT
      id, user_id, emoji, action, description, latitude, longitude,
      created_at, expires_at
    FROM micro_cards
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
      emoji: item.emoji,
      action: item.action,
      description: item.description,
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

// POST /v1/micro-cards - create new card
microCards.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  if (!body.emoji || !body.action || !body.latitude || !body.longitude) {
    throw new BadRequestError("emoji_action_latitude_longitude_required");
  }

  const expiresAt = body.expires_at ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const result = await c.env.DB.prepare(`
    INSERT INTO micro_cards (user_id, emoji, action, description, latitude, longitude, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    RETURNING id
  `)
    .bind(userId, body.emoji, body.action, body.description ?? null, body.latitude, body.longitude, expiresAt)
    .first();

  return c.json(
    {
      id: String((result as any).id),
      userId: String(userId),
      emoji: body.emoji,
      action: body.action,
      description: body.description ?? null,
      latitude: body.latitude,
      longitude: body.longitude,
      expiresAt
    },
    { status: 201 }
  );
});

// GET /v1/micro-cards/mine - get user's cards
microCards.get("/mine", async (c) => {
  const userId = c.get("userId");

  const items = await c.env.DB.prepare(`
    SELECT
      id, user_id, emoji, action, description, latitude, longitude,
      created_at, expires_at
    FROM micro_cards
    WHERE user_id = ? AND deleted_at IS NULL
    ORDER BY created_at DESC
  `)
    .bind(userId)
    .all();

  return c.json({
    items: (items.results ?? []).map((item: any) => ({
      id: String(item.id),
      userId: String(item.user_id),
      emoji: item.emoji,
      action: item.action,
      description: item.description,
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      createdAt: item.created_at,
      expiresAt: item.expires_at
    })),
    meta: { totalCount: (items.results ?? []).length }
  });
});

// POST /v1/micro-cards/:id/react - react to a card
microCards.post("/:id/react", async (c) => {
  const userId = c.get("userId");
  const cardId = c.req.param("id");
  const body = await c.req.json();

  const reactionType = body.reaction_type;
  if (!["join", "like", "wave"].includes(reactionType)) {
    throw new BadRequestError("invalid_reaction_type");
  }

  const card = await c.env.DB.prepare(`
    SELECT id FROM micro_cards WHERE id = ? AND deleted_at IS NULL
  `)
    .bind(cardId)
    .first();

  if (!card) {
    throw new NotFoundError("card_not_found");
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO card_reactions (card_id, user_id, reaction_type, created_at)
    VALUES (?, ?, ?, datetime('now'))
    RETURNING id
  `)
    .bind(cardId, userId, reactionType)
    .first();

  return c.json(
    {
      id: String((result as any).id),
      cardId: String(cardId),
      userId: String(userId),
      reactionType
    },
    { status: 201 }
  );
});

// DELETE /v1/micro-cards/:id - deactivate card
microCards.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const cardId = c.req.param("id");

  const card = await c.env.DB.prepare(`
    SELECT id, user_id FROM micro_cards WHERE id = ? AND user_id = ?
  `)
    .bind(cardId, userId)
    .first();

  if (!card) {
    throw new NotFoundError("card_not_found");
  }

  await c.env.DB.prepare(`
    UPDATE micro_cards SET deleted_at = datetime('now') WHERE id = ?
  `)
    .bind(cardId)
    .run();

  return c.json({ message: "card_deactivated" });
});

export default microCards;
