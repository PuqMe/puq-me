import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";
import { NotFoundError } from "../lib/errors.js";

const profiles = new Hono<AppContext>();

// All profile routes require authentication
profiles.use("/*", auth);

// GET /v1/profiles/me
profiles.get("/me", async (c) => {
  const userId = c.get("userId");

  const profile = await c.env.DB.prepare(`
    SELECT
      u.id, u.public_id, u.email, u.status, u.created_at as user_created_at,
      p.display_name, p.birth_date, p.bio, p.gender, p.interested_in,
      p.city, p.country_code, p.is_visible, p.moderation_status, p.profile_quality_score,
      ul.latitude, ul.longitude,
      up.min_age, up.max_age, up.max_distance_km,
      up.interested_in as preference_interested_in, up.only_verified_profiles
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    LEFT JOIN user_locations ul ON ul.user_id = u.id
    LEFT JOIN user_preferences up ON up.user_id = u.id
    WHERE u.id = ? AND u.deleted_at IS NULL
    LIMIT 1
  `).bind(userId).first();

  if (!profile) {
    throw new NotFoundError("profile_not_found");
  }

  // Get photos
  const photos = await c.env.DB.prepare(`
    SELECT id, storage_key, cdn_url, sort_order, is_primary, moderation_status, created_at
    FROM profile_photos
    WHERE user_id = ? AND deleted_at IS NULL
    ORDER BY sort_order ASC
  `).bind(userId).all();

  return c.json({
    user: {
      id: String(profile.id),
      publicId: profile.public_id,
      email: profile.email,
      status: profile.status,
      createdAt: profile.user_created_at
    },
    profile: {
      displayName: profile.display_name,
      birthDate: profile.birth_date,
      bio: profile.bio,
      gender: profile.gender,
      interestedIn: profile.interested_in,
      city: profile.city,
      countryCode: profile.country_code,
      isVisible: Boolean(profile.is_visible),
      moderationStatus: profile.moderation_status,
      profileQualityScore: Number(profile.profile_quality_score ?? 0)
    },
    location: profile.latitude
      ? { latitude: Number(profile.latitude), longitude: Number(profile.longitude) }
      : null,
    preferences: {
      minAge: Number(profile.min_age ?? 18),
      maxAge: Number(profile.max_age ?? 99),
      maxDistanceKm: Number(profile.max_distance_km ?? 50),
      interestedIn: profile.preference_interested_in
        ? JSON.parse(profile.preference_interested_in as string)
        : ["everyone"],
      onlyVerifiedProfiles: Boolean(profile.only_verified_profiles ?? 0)
    },
    photos: (photos.results ?? []).map((p: any) => ({
      id: String(p.id),
      storageKey: p.storage_key,
      cdnUrl: p.cdn_url,
      sortOrder: p.sort_order,
      isPrimary: Boolean(p.is_primary),
      moderationStatus: p.moderation_status,
      createdAt: p.created_at
    }))
  });
});

// PATCH /v1/profiles/me
profiles.patch("/me", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];

  if (body.displayName !== undefined) {
    updates.push("display_name = ?");
    values.push(body.displayName);
  }
  if (body.bio !== undefined) {
    updates.push("bio = ?");
    values.push(body.bio);
  }
  if (body.gender !== undefined) {
    updates.push("gender = ?");
    values.push(body.gender);
  }
  if (body.interestedIn !== undefined) {
    updates.push("interested_in = ?");
    values.push(body.interestedIn);
  }
  if (body.birthDate !== undefined) {
    updates.push("birth_date = ?");
    values.push(body.birthDate);
  }
  if (body.city !== undefined) {
    updates.push("city = ?");
    values.push(body.city);
  }
  if (body.countryCode !== undefined) {
    updates.push("country_code = ?");
    values.push(body.countryCode);
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    values.push(userId);
    await c.env.DB.prepare(
      `UPDATE profiles SET ${updates.join(", ")} WHERE user_id = ?`
    ).bind(...values).run();
  }

  return c.json({ message: "profile_updated" });
});

// PATCH /v1/profiles/me/visibility
profiles.patch("/me/visibility", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  await c.env.DB.prepare(
    `UPDATE profiles SET is_visible = ?, updated_at = datetime('now') WHERE user_id = ?`
  ).bind(body.isVisible ? 1 : 0, userId).run();

  return c.json({ message: "visibility_updated" });
});

// PUT /v1/profiles/me/interests
profiles.put("/me/interests", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  await c.env.DB.prepare(
    `UPDATE profiles SET interested_in = ?, updated_at = datetime('now') WHERE user_id = ?`
  ).bind(body.interestedIn, userId).run();

  return c.json({ message: "interests_updated" });
});

// PUT /v1/profiles/me/preferences
profiles.put("/me/preferences", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  await c.env.DB.prepare(`
    INSERT INTO user_preferences (user_id, min_age, max_age, max_distance_km, interested_in, only_verified_profiles)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (user_id) DO UPDATE SET
      min_age = excluded.min_age,
      max_age = excluded.max_age,
      max_distance_km = excluded.max_distance_km,
      interested_in = excluded.interested_in,
      only_verified_profiles = excluded.only_verified_profiles,
      updated_at = datetime('now')
  `).bind(
    userId,
    body.minAge ?? 18,
    body.maxAge ?? 99,
    body.maxDistanceKm ?? 50,
    JSON.stringify(body.interestedIn ?? ["everyone"]),
    body.onlyVerifiedProfiles ? 1 : 0
  ).run();

  return c.json({ message: "preferences_updated" });
});

// PUT /v1/profiles/me/location
profiles.put("/me/location", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  await c.env.DB.prepare(`
    INSERT INTO user_locations (user_id, latitude, longitude)
    VALUES (?, ?, ?)
    ON CONFLICT (user_id) DO UPDATE SET
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      updated_at = datetime('now')
  `).bind(userId, body.latitude, body.longitude).run();

  // Update last_active_at
  c.executionCtx.waitUntil(
    c.env.DB.prepare(
      `UPDATE users SET last_active_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
    ).bind(userId).run()
  );

  return c.json({ message: "location_updated" });
});

export default profiles;
