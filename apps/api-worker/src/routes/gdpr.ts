import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";

const gdpr = new Hono<AppContext>();
gdpr.use("/*", auth);

/**
 * GET /v1/gdpr/export
 *
 * DSGVO Art. 20 — Right to data portability.
 * Returns the entire user record set as a JSON document.
 *
 * Strategy: read every table that references this user_id (or owns rows
 * by FK) and inline the rows. The response is a single JSON file the
 * client can download as proof of data export.
 *
 * POST also accepted (web client posts without body); both behave the same.
 */
async function buildExport(c: any) {
  const userId = c.get("userId");

  const user = await c.env.DB.prepare(
    `SELECT id, public_id, email, status, created_at, updated_at, last_active_at,
            email_verified_at
     FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1`
  ).bind(userId).first();

  if (!user) {
    return c.json({ error: { code: "not_found", message: "user_not_found" } }, 404);
  }

  const profile = await c.env.DB.prepare(
    `SELECT user_id, display_name, birth_date, bio, gender, dating_intent,
            occupation, city, country_code, is_visible, interested_in,
            created_at, updated_at
     FROM profiles WHERE user_id = ? LIMIT 1`
  ).bind(userId).first();

  const photos = (await c.env.DB.prepare(
    `SELECT id, storage_key, cdn_url, sort_order, is_primary, moderation_status, created_at
     FROM profile_photos WHERE user_id = ? AND deleted_at IS NULL`
  ).bind(userId).all()).results;

  const preferences = await c.env.DB.prepare(
    `SELECT user_id, min_age, max_age, max_distance_km, interested_in,
            show_me_globally, only_verified_profiles, updated_at
     FROM user_preferences WHERE user_id = ? LIMIT 1`
  ).bind(userId).first();

  const location = await c.env.DB.prepare(
    `SELECT user_id, latitude, longitude, city_label, updated_at
     FROM user_locations WHERE user_id = ? LIMIT 1`
  ).bind(userId).first();

  // location_events (added by migration 0004) — best-effort, table may not exist on old DBs
  let locationEvents: any[] = [];
  try {
    locationEvents = (await c.env.DB.prepare(
      `SELECT id, lat, lon, accuracy_meters, captured_at, server_received_at
       FROM location_events WHERE user_id = ? ORDER BY server_received_at DESC LIMIT 1000`
    ).bind(userId).all()).results;
  } catch {
    // table not present — skip
  }

  // Encounters (other users this person has been near)
  const encounters = (await c.env.DB.prepare(
    `SELECT id, encountered_user_id, distance_meters, encounter_count,
            first_seen_at, last_seen_at
     FROM encounters WHERE user_id = ? ORDER BY last_seen_at DESC LIMIT 500`
  ).bind(userId).all()).results.length
    ? (await c.env.DB.prepare(
        `SELECT id, encountered_user_id, distance_meters, encounter_count,
                first_seen_at, last_seen_at
         FROM encounters WHERE user_id = ? ORDER BY last_seen_at DESC LIMIT 500`
      ).bind(userId).all()).results
    : [];

  // Followers / following
  const followers = (await c.env.DB.prepare(
    `SELECT follower_user_id, created_at FROM followers WHERE following_user_id = ?`
  ).bind(userId).all()).results;
  const following = (await c.env.DB.prepare(
    `SELECT following_user_id, created_at FROM followers WHERE follower_user_id = ?`
  ).bind(userId).all()).results;

  // Auth-issued refresh sessions
  let sessions: any[] = [];
  try {
    sessions = (await c.env.DB.prepare(
      `SELECT id, created_at, expires_at, last_used_at, user_agent, ip_hash
       FROM refresh_sessions WHERE user_id = ?`
    ).bind(userId).all()).results;
  } catch {
    // table may not exist — skip
  }

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

  // Set Content-Disposition so browsers prompt download.
  c.header("Content-Disposition",
    `attachment; filename="puqme-export-${userId}-${generatedAt.slice(0,10)}.json"`);
  return c.json(payload);
}

gdpr.get("/export", buildExport);
gdpr.post("/export", buildExport);

export default gdpr;
