import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";
import { BadRequestError, NotFoundError, ConflictError } from "../lib/errors.js";

const groups = new Hono<AppContext>();

groups.use("/*", auth);

// GET /v1/groups - list active groups nearby
groups.get("/", async (c) => {
  const userId = c.get("userId");
  const latitude = c.req.query("latitude");
  const longitude = c.req.query("longitude");
  const radiusKm = c.req.query("radius_km") ?? "10";

  if (!latitude || !longitude) {
    throw new BadRequestError("latitude_and_longitude_required");
  }

  const items = await c.env.DB.prepare(`
    SELECT
      id, creator_user_id, name, emoji, location_name, max_participants, scheduled_at,
      created_at,
      (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
    FROM groups g
    WHERE is_active = 1
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
      creatorUserId: String(item.creator_user_id),
      name: item.name,
      emoji: item.emoji,
      locationName: item.location_name,
      maxParticipants: Number(item.max_participants),
      memberCount: Number(item.member_count),
      scheduledAt: item.scheduled_at,
      createdAt: item.created_at
    })),
    meta: {
      totalCount: (items.results ?? []).length,
      userLocation: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
    }
  });
});

// POST /v1/groups - create group
groups.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  if (!body.name || !body.emoji || !body.location_name) {
    throw new BadRequestError("name_emoji_location_required");
  }

  const maxParticipants = body.max_participants ?? 10;
  const scheduledAt = body.scheduled_at ?? new Date().toISOString();

  const result = await c.env.DB.prepare(`
    INSERT INTO groups (creator_user_id, name, emoji, location_name, max_participants, scheduled_at, latitude, longitude, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    RETURNING id
  `)
    .bind(userId, body.name, body.emoji, body.location_name, maxParticipants, scheduledAt, body.latitude, body.longitude)
    .first();

  const groupId = (result as any).id;

  // Add creator as first member
  await c.env.DB.prepare(`
    INSERT INTO group_members (group_id, user_id, joined_at)
    VALUES (?, ?, datetime('now'))
  `)
    .bind(groupId, userId)
    .run();

  return c.json(
    {
      id: String(groupId),
      userId: String(userId),
      name: body.name,
      emoji: body.emoji,
      locationName: body.location_name,
      maxParticipants,
      memberCount: 1,
      scheduledAt
    },
    { status: 201 }
  );
});

// GET /v1/groups/mine - get my groups
groups.get("/mine", async (c) => {
  const userId = c.get("userId");

  const items = await c.env.DB.prepare(`
    SELECT
      g.id, g.creator_user_id, g.name, g.emoji, g.location_name, g.max_participants, g.scheduled_at,
      g.created_at,
      (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
    FROM groups g
    JOIN group_members gm ON gm.group_id = g.id
    WHERE gm.user_id = ? AND g.is_active = 1
    ORDER BY g.created_at DESC
  `)
    .bind(userId)
    .all();

  return c.json({
    items: (items.results ?? []).map((item: any) => ({
      id: String(item.id),
      creatorUserId: String(item.creator_user_id),
      name: item.name,
      emoji: item.emoji,
      locationName: item.location_name,
      maxParticipants: Number(item.max_participants),
      memberCount: Number(item.member_count),
      scheduledAt: item.scheduled_at,
      createdAt: item.created_at
    })),
    meta: { totalCount: (items.results ?? []).length }
  });
});

// POST /v1/groups/:id/join - join a group
groups.post("/:id/join", async (c) => {
  const userId = c.get("userId");
  const groupId = c.req.param("id");

  const group = await c.env.DB.prepare(`
    SELECT id, max_participants FROM groups WHERE id = ? AND is_active = 1
  `)
    .bind(groupId)
    .first();

  if (!group) {
    throw new NotFoundError("group_not_found");
  }

  const existing = await c.env.DB.prepare(`
    SELECT id FROM group_members WHERE group_id = ? AND user_id = ?
  `)
    .bind(groupId, userId)
    .first();

  if (existing) {
    throw new ConflictError("already_member");
  }

  const memberCount = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM group_members WHERE group_id = ?
  `)
    .bind(groupId)
    .first();

  if (Number((memberCount as any).count) >= Number((group as any).max_participants)) {
    throw new ConflictError("group_full");
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO group_members (group_id, user_id, joined_at)
    VALUES (?, ?, datetime('now'))
    RETURNING id
  `)
    .bind(groupId, userId)
    .first();

  return c.json(
    {
      id: String((result as any).id),
      groupId: String(groupId),
      userId: String(userId)
    },
    { status: 201 }
  );
});

// DELETE /v1/groups/:id/leave - leave a group
groups.delete("/:id/leave", async (c) => {
  const userId = c.get("userId");
  const groupId = c.req.param("id");

  const membership = await c.env.DB.prepare(`
    SELECT id FROM group_members WHERE group_id = ? AND user_id = ?
  `)
    .bind(groupId, userId)
    .first();

  if (!membership) {
    throw new NotFoundError("membership_not_found");
  }

  await c.env.DB.prepare(`
    DELETE FROM group_members WHERE group_id = ? AND user_id = ?
  `)
    .bind(groupId, userId)
    .run();

  return c.json({ message: "left_group" });
});

export default groups;
