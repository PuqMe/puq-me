import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";
import { BadRequestError, NotFoundError } from "../lib/errors.js";

const swipe = new Hono<AppContext>();

swipe.use("/*", auth);

/**
 * Haversine distance calculation in km.
 * Simplified version for SQLite (no trig functions in D1).
 */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

function calculateAge(birthDate: string): number {
  const now = new Date();
  const date = new Date(birthDate);
  let age = now.getUTCFullYear() - date.getUTCFullYear();
  const monthOffset = now.getUTCMonth() - date.getUTCMonth();
  if (monthOffset < 0 || (monthOffset === 0 && now.getUTCDate() < date.getUTCDate())) {
    age -= 1;
  }
  return age;
}

// GET /v1/swipe/radar
swipe.get("/radar", async (c) => {
  const userId = c.get("userId");
  const limit = parseInt(c.req.query("limit") ?? "12", 10);
  const refresh = c.req.query("refresh") === "true";

  // Check KV cache first
  const cacheKey = `radar:deck:${userId}`;
  if (!refresh) {
    const cached = await c.env.KV.get(cacheKey);
    if (cached) {
      const cachedIds = JSON.parse(cached) as string[];
      if (cachedIds.length >= limit) {
        const requestedIds = cachedIds.slice(0, limit);
        const remainingIds = cachedIds.slice(limit);

        // Hydrate from DB
        const hydrated = await hydrateCandidates(c.env, userId, requestedIds);

        c.executionCtx.waitUntil(
          c.env.KV.put(cacheKey, JSON.stringify(remainingIds), { expirationTtl: 600 })
        );

        return c.json({
          items: hydrated,
          cache: { hit: true, remaining: remainingIds.length }
        });
      }
    }
  }

  // Get viewer preferences
  const prefs = await c.env.DB.prepare(
    `SELECT min_age, max_age, max_distance_km, interested_in, only_verified_profiles FROM user_preferences WHERE user_id = ? LIMIT 1`
  ).bind(userId).first<{
    min_age: number;
    max_age: number;
    max_distance_km: number;
    interested_in: string;
    only_verified_profiles: number;
  }>();

  const minAge = prefs?.min_age ?? 18;
  const maxAge = prefs?.max_age ?? 99;
  const maxDistKm = prefs?.max_distance_km ?? 50;
  const interestedIn: string[] = prefs?.interested_in ? JSON.parse(prefs.interested_in) : ["everyone"];

  // Get viewer location
  const loc = await c.env.DB.prepare(
    `SELECT latitude, longitude FROM user_locations WHERE user_id = ? LIMIT 1`
  ).bind(userId).first<{ latitude: number; longitude: number }>();

  const viewerLat = loc?.latitude ?? 0;
  const viewerLon = loc?.longitude ?? 0;

  // Retrieve candidates - SQLite doesn't have trig functions, so we use a bounding box filter
  // then compute exact distance in app layer
  const latDelta = maxDistKm / 111.0;
  const lonDelta = maxDistKm / (111.0 * Math.cos((viewerLat * Math.PI) / 180));

  const candidates = await c.env.DB.prepare(`
    SELECT
      u.id, p.display_name, p.birth_date, p.bio, p.city, p.country_code,
      pp.cdn_url as primary_photo_url,
      ul.latitude, ul.longitude,
      COALESCE(p.profile_quality_score, 0) as profile_quality_score,
      u.last_active_at, u.created_at,
      COALESCE(ucrs.risk_score, 0) as comm_risk_score
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    JOIN user_locations ul ON ul.user_id = u.id
    LEFT JOIN user_communication_risk_scores ucrs ON ucrs.user_id = u.id
    LEFT JOIN profile_photos pp ON pp.user_id = u.id AND pp.is_primary = 1 AND pp.deleted_at IS NULL
    WHERE u.id <> ?
      AND u.deleted_at IS NULL
      AND u.status = 'active'
      AND p.is_visible = 1
      AND ul.latitude BETWEEN ? AND ?
      AND ul.longitude BETWEEN ? AND ?
      AND NOT EXISTS (SELECT 1 FROM swipes s WHERE s.actor_user_id = ? AND s.target_user_id = u.id)
      AND NOT EXISTS (
        SELECT 1 FROM matches m
        WHERE m.user_low_id = MIN(?, u.id)
          AND m.user_high_id = MAX(?, u.id)
          AND m.status = 'active'
      )
      AND NOT EXISTS (
        SELECT 1 FROM blocked_users b
        WHERE (b.blocker_user_id = ? AND b.blocked_user_id = u.id)
           OR (b.blocker_user_id = u.id AND b.blocked_user_id = ?)
      )
    ORDER BY p.profile_quality_score DESC, u.last_active_at DESC
    LIMIT ?
  `).bind(
    userId,
    viewerLat - latDelta, viewerLat + latDelta,
    viewerLon - lonDelta, viewerLon + lonDelta,
    userId,
    userId, userId,
    userId, userId,
    Math.max(limit * 4, 80)
  ).all();

  // Filter by age, distance, and interested_in in app layer
  const now = new Date();
  const filtered = (candidates.results ?? [])
    .map((row: any) => {
      const age = calculateAge(row.birth_date);
      const distanceKm = haversineKm(viewerLat, viewerLon, Number(row.latitude), Number(row.longitude));

      const lastActive = row.last_active_at ? new Date(row.last_active_at) : null;
      const hoursSinceActive = lastActive ? (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60) : Infinity;

      const activityScore =
        hoursSinceActive <= 1 ? 100 :
        hoursSinceActive <= 24 ? 75 :
        hoursSinceActive <= 72 ? 45 : 15;

      const responseProbabilityScore = Math.max(5, Math.min(100,
        100 - Number(row.comm_risk_score) + (hoursSinceActive <= 24 ? 10 : 0)
      ));

      return {
        userId: String(row.id),
        displayName: row.display_name,
        age,
        bio: row.bio,
        city: row.city,
        countryCode: row.country_code,
        primaryPhotoUrl: row.primary_photo_url,
        distanceKm,
        profileQualityScore: Number(row.profile_quality_score),
        activityScore,
        responseProbabilityScore,
        feedScore: Number(row.profile_quality_score) * 0.3 + activityScore * 0.3 + responseProbabilityScore * 0.4
      };
    })
    .filter((c: any) => {
      if (c.age < minAge || c.age > maxAge) return false;
      if (c.distanceKm > maxDistKm) return false;
      return true;
    })
    .sort((a: any, b: any) => b.feedScore - a.feedScore);

  const requestedItems = filtered.slice(0, limit);
  const remainingIds = filtered.slice(limit).map((c: any) => c.userId);

  // Cache remaining IDs
  c.executionCtx.waitUntil(
    c.env.KV.put(cacheKey, JSON.stringify(remainingIds), { expirationTtl: 600 })
  );

  return c.json({
    items: requestedItems,
    cache: { hit: false, remaining: remainingIds.length }
  });
});

// GET /v1/swipe/discover (alias for radar)
swipe.get("/discover", async (c) => {
  // Redirect internally to radar handler
  const url = new URL(c.req.url);
  url.pathname = url.pathname.replace("/discover", "/radar");
  return c.redirect(url.pathname + url.search, 307);
});

// POST /v1/swipe
swipe.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const targetUserId = body.targetUserId;
  const direction = body.direction;

  if (userId === targetUserId) {
    throw new BadRequestError("cannot_swipe_own_profile");
  }

  if (!["left", "right", "super"].includes(direction)) {
    throw new BadRequestError("invalid_direction");
  }

  // Verify target exists
  const target = await c.env.DB.prepare(
    `SELECT id FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1`
  ).bind(targetUserId).first();

  if (!target) {
    throw new NotFoundError("target_profile_not_found");
  }

  // Create or update swipe
  const result = await c.env.DB.prepare(`
    INSERT INTO swipes (actor_user_id, target_user_id, direction, source)
    VALUES (?, ?, ?, 'radar')
    ON CONFLICT (actor_user_id, target_user_id)
    DO UPDATE SET direction = excluded.direction, updated_at = datetime('now')
    RETURNING id
  `).bind(userId, targetUserId, direction).first<{ id: number }>();

  // Clear radar cache
  c.executionCtx.waitUntil(c.env.KV.delete(`radar:deck:${userId}`));

  // Check for match on positive swipe
  let isMatch = false;
  if (direction !== "left") {
    const mutualSwipe = await c.env.DB.prepare(
      `SELECT 1 FROM swipes WHERE actor_user_id = ? AND target_user_id = ? AND direction IN ('right', 'super') LIMIT 1`
    ).bind(targetUserId, userId).first();

    if (mutualSwipe) {
      const lowId = Math.min(Number(userId), Number(targetUserId));
      const highId = Math.max(Number(userId), Number(targetUserId));

      // Create match
      const match = await c.env.DB.prepare(`
        INSERT INTO matches (user_low_id, user_high_id, status)
        VALUES (?, ?, 'active')
        ON CONFLICT (user_low_id, user_high_id)
        DO UPDATE SET status = 'active', unmatched_at = NULL, updated_at = datetime('now')
        RETURNING id
      `).bind(lowId, highId).first<{ id: number }>();

      if (match) {
        // Create conversation
        await c.env.DB.prepare(`
          INSERT INTO conversations (match_id, started_by_user_id, status)
          VALUES (?, ?, 'active')
          ON CONFLICT (match_id)
          DO UPDATE SET status = 'active', updated_at = datetime('now')
        `).bind(match.id, userId).run();

        isMatch = true;
      }
    }
  }

  return c.json({
    swipeId: String(result?.id),
    targetUserId,
    direction,
    isMatch
  });
});

// Helper function to hydrate candidates from cached IDs
async function hydrateCandidates(env: AppContext["Bindings"], userId: string, candidateIds: string[]) {
  if (candidateIds.length === 0) return [];

  const placeholders = candidateIds.map(() => "?").join(",");

  const loc = await env.DB.prepare(
    `SELECT latitude, longitude FROM user_locations WHERE user_id = ? LIMIT 1`
  ).bind(userId).first<{ latitude: number; longitude: number }>();

  const viewerLat = loc?.latitude ?? 0;
  const viewerLon = loc?.longitude ?? 0;

  const results = await env.DB.prepare(`
    SELECT
      u.id, p.display_name, p.birth_date, p.bio, p.city, p.country_code,
      pp.cdn_url as primary_photo_url,
      ul.latitude, ul.longitude,
      COALESCE(p.profile_quality_score, 0) as profile_quality_score,
      u.last_active_at,
      COALESCE(ucrs.risk_score, 0) as comm_risk_score
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    JOIN user_locations ul ON ul.user_id = u.id
    LEFT JOIN user_communication_risk_scores ucrs ON ucrs.user_id = u.id
    LEFT JOIN profile_photos pp ON pp.user_id = u.id AND pp.is_primary = 1 AND pp.deleted_at IS NULL
    WHERE u.id IN (${placeholders})
  `).bind(...candidateIds).all();

  const now = new Date();
  return (results.results ?? []).map((row: any) => {
    const lastActive = row.last_active_at ? new Date(row.last_active_at) : null;
    const hoursSinceActive = lastActive ? (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60) : Infinity;

    return {
      userId: String(row.id),
      displayName: row.display_name,
      age: calculateAge(row.birth_date),
      bio: row.bio,
      city: row.city,
      countryCode: row.country_code,
      primaryPhotoUrl: row.primary_photo_url,
      distanceKm: haversineKm(viewerLat, viewerLon, Number(row.latitude), Number(row.longitude)),
      profileQualityScore: Number(row.profile_quality_score),
      activityScore: hoursSinceActive <= 1 ? 100 : hoursSinceActive <= 24 ? 75 : hoursSinceActive <= 72 ? 45 : 15,
      responseProbabilityScore: Math.max(5, Math.min(100, 100 - Number(row.comm_risk_score) + (hoursSinceActive <= 24 ? 10 : 0))),
      feedScore: 0
    };
  });
}

export default swipe;
