import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";

const gdpr = new Hono<AppContext>();
gdpr.use("/*", auth);

// Defensive D1 read: returns undefined on any error (table missing,
// column mismatch, …) so the export never 500s on a single bad table.
async function safeFirst(db: any, sql: string, ...binds: any[]): Promise<any> {
  try {
    return await db.prepare(sql).bind(...binds).first();
  } catch {
    return null;
  }
}
async function safeAll(db: any, sql: string, ...binds: any[]): Promise<any[]> {
  try {
    const r = await db.prepare(sql).bind(...binds).all();
    return r.results ?? [];
  } catch {
    return [];
  }
}

/**
 * GET /v1/gdpr/export
 *
 * DSGVO Art. 20 — Right to data portability.
 * Reads every user-owned table defensively (missing tables → empty arrays)
 * and returns one self-contained JSON document the client can download.
 */
async function buildExport(c: any) {
  const userId = c.get("userId");
  const db = c.env.DB;

  const user = await safeFirst(db,
    `SELECT id, public_id, email, status, created_at, updated_at, last_active_at,
            email_verified_at
     FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
    userId);

  if (!user) {
    return c.json({ error: { code: "not_found", message: "user_not_found" } }, 404);
  }

  const profile = await safeFirst(db,
    `SELECT user_id, display_name, birth_date, bio, gender, dating_intent,
            occupation, city, country_code, is_visible, interested_in,
            created_at, updated_at
     FROM profiles WHERE user_id = ? LIMIT 1`,
    userId);

  const photos = await safeAll(db,
    `SELECT id, storage_key, cdn_url, sort_order, is_primary, moderation_status, created_at
     FROM profile_photos WHERE user_id = ? AND deleted_at IS NULL`,
    userId);

  const preferences = await safeFirst(db,
    `SELECT user_id, min_age, max_age, max_distance_km, interested_in,
            show_me_globally, only_verified_profiles, updated_at
     FROM user_preferences WHERE user_id = ? LIMIT 1`,
    userId);

  const location = await safeFirst(db,
    `SELECT user_id, latitude, longitude, city_label, updated_at
     FROM user_locations WHERE user_id = ? LIMIT 1`,
    userId);

  const locationEvents = await safeAll(db,
    `SELECT id, lat, lon, accuracy_meters, captured_at, server_received_at
     FROM location_events WHERE user_id = ? ORDER BY server_received_at DESC LIMIT 1000`,
    userId);

  const encounters = await safeAll(db,
    `SELECT id, encountered_user_id, distance_meters, encounter_count,
            first_seen_at, last_seen_at
     FROM encounters WHERE user_id = ? ORDER BY last_seen_at DESC LIMIT 500`,
    userId);

  const followers = await safeAll(db,
    `SELECT follower_user_id, created_at FROM followers WHERE following_user_id = ?`,
    userId);
  const following = await safeAll(db,
    `SELECT following_user_id, created_at FROM followers WHERE follower_user_id = ?`,
    userId);

  const sessions = await safeAll(db,
    `SELECT id, created_at, expires_at, last_used_at, user_agent, ip_hash
     FROM refresh_sessions WHERE user_id = ?`,
    userId);

  const generatedAt = new Date().toISOString();
  const payload = {
    schema: "puqme-gdpr-export-v1",
    article: "DSGVO Art. 20 (Recht auf Datenübertragbarkeit)",
    generatedAt,
    user,
    profile,
    photos,
    preferences,
    location,
    location_events: locationEvents,
    encounters,
    followers,
    following,
    sessions
  };

  c.header("Content-Disposition",
    `attachment; filename="puqme-export-${userId}-${generatedAt.slice(0,10)}.json"`);
  return c.json(payload);
}

gdpr.get("/export", buildExport);
gdpr.post("/export", buildExport);

export default gdpr;
