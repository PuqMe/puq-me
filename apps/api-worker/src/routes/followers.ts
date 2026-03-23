import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";
import { NotFoundError, ConflictError } from "../lib/errors.js";

const followers = new Hono<AppContext>();

followers.use("/*", auth);

// GET /v1/followers - get my followers
followers.get("/", async (c) => {
  const userId = c.get("userId");

  const items = await c.env.DB.prepare(`
    SELECT
      f.id, f.follower_user_id, f.following_user_id, f.created_at,
      p.display_name
    FROM followers f
    LEFT JOIN profiles p ON p.user_id = f.follower_user_id
    WHERE f.following_user_id = ?    ORDER BY f.created_at DESC
  `)
    .bind(userId)
    .all();

  return c.json({
    items: (items.results ?? []).map((item: any) => ({
      id: String(item.id),
      followerUserId: String(item.follower_user_id),
      followingUserId: String(item.following_user_id),
      displayName: item.display_name ?? null,
      createdAt: item.created_at
    })),
    meta: { totalCount: (items.results ?? []).length }
  });
});

// GET /v1/following - get who I follow
followers.get("/following", async (c) => {
  const userId = c.get("userId");

  const items = await c.env.DB.prepare(`
    SELECT
      f.id, f.follower_user_id, f.following_user_id, f.created_at,
      p.display_name
    FROM followers f
    LEFT JOIN profiles p ON p.user_id = f.following_user_id
    WHERE f.follower_user_id = ?    ORDER BY f.created_at DESC
  `)
    .bind(userId)
    .all();

  return c.json({
    items: (items.results ?? []).map((item: any) => ({
      id: String(item.id),
      followerUserId: String(item.follower_user_id),
      followingUserId: String(item.following_user_id),
      displayName: item.display_name ?? null,
      createdAt: item.created_at
    })),
    meta: { totalCount: (items.results ?? []).length }
  });
});

// POST /v1/followers/:userId/follow - follow a user
followers.post("/:targetUserId/follow", async (c) => {
  const userId = c.get("userId");
  const targetUserId = c.req.param("targetUserId");

  if (userId === targetUserId) {
    throw new ConflictError("cannot_follow_self");
  }

  const targetUser = await c.env.DB.prepare(`
    SELECT id FROM users WHERE id = ?  `)
    .bind(targetUserId)
    .first();

  if (!targetUser) {
    throw new NotFoundError("user_not_found");
  }

  const existing = await c.env.DB.prepare(`
    SELECT id FROM followers WHERE follower_user_id = ? AND following_user_id = ?  `)
    .bind(userId, targetUserId)
    .first();

  if (existing) {
    throw new ConflictError("already_following");
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO followers (follower_user_id, following_user_id, created_at)
    VALUES (?, ?, datetime('now'))
    RETURNING id
  `)
    .bind(userId, targetUserId)
    .first();

  return c.json(
    {
      id: String((result as any).id),
      followerUserId: String(userId),
      followingUserId: String(targetUserId)
    },
    { status: 201 }
  );
});

// DELETE /v1/followers/:userId/unfollow - unfollow a user
followers.delete("/:targetUserId/unfollow", async (c) => {
  const userId = c.get("userId");
  const targetUserId = c.req.param("targetUserId");

  const follow = await c.env.DB.prepare(`
    SELECT id FROM followers WHERE follower_user_id = ? AND following_user_id = ?
  `)
    .bind(userId, targetUserId)
    .first();

  if (!follow) {
    throw new NotFoundError("follow_not_found");
  }

  await c.env.DB.prepare(`
    DELETE FROM followers WHERE follower_user_id = ? AND following_user_id = ?
  `)
    .bind(userId, targetUserId)
    .run();

  return c.json({ message: "unfollowed" });
});

// GET /v1/followers/stats - get follower/following counts
followers.get("/stats", async (c) => {
  const userId = c.get("userId");

  const followerCount = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM follows
    WHERE following_user_id = ?  `)
    .bind(userId)
    .first();

  const followingCount = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM follows
    WHERE follower_user_id = ?  `)
    .bind(userId)
    .first();

  return c.json({
    userId: String(userId),
    followerCount: Number((followerCount as any).count) || 0,
    followingCount: Number((followingCount as any).count) || 0
  });
});

export default followers;
