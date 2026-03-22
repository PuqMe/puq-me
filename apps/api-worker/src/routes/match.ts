import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";
import { ForbiddenError, NotFoundError } from "../lib/errors.js";

const match = new Hono<AppContext>();

match.use("/*", auth);

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

function mapMatchRow(row: any) {
  return {
    matchId: String(row.match_id),
    status: row.status,
    matchedAt: row.matched_at,
    peer: {
      userId: String(row.peer_user_id),
      displayName: row.peer_display_name,
      age: calculateAge(row.peer_birth_date),
      bio: row.peer_bio,
      city: row.peer_city,
      countryCode: row.peer_country_code,
      primaryPhotoUrl: row.peer_primary_photo_url
    },
    conversation: {
      conversationId: row.conversation_id ? String(row.conversation_id) : null,
      lastMessageAt: row.last_message_at
    }
  };
}

const MATCH_LIST_QUERY = `
  SELECT
    m.id as match_id,
    m.status,
    m.matched_at,
    peer.id as peer_user_id,
    p.display_name as peer_display_name,
    p.birth_date as peer_birth_date,
    p.bio as peer_bio,
    p.city as peer_city,
    p.country_code as peer_country_code,
    pp.cdn_url as peer_primary_photo_url,
    c.id as conversation_id,
    c.last_message_at
  FROM matches m
  JOIN users peer
    ON peer.id = CASE
      WHEN m.user_low_id = ?1 THEN m.user_high_id
      ELSE m.user_low_id
    END
  JOIN profiles p ON p.user_id = peer.id
  LEFT JOIN profile_photos pp
    ON pp.user_id = peer.id
    AND pp.is_primary = 1
    AND pp.deleted_at IS NULL
  LEFT JOIN conversations c ON c.match_id = m.id
`;

// GET /v1/matches
match.get("/", async (c) => {
  const userId = c.get("userId");

  const results = await c.env.DB.prepare(`
    ${MATCH_LIST_QUERY}
    WHERE (m.user_low_id = ?1 OR m.user_high_id = ?1)
      AND m.status = 'active'
    ORDER BY m.matched_at DESC
  `).bind(userId).all();

  return c.json((results.results ?? []).map(mapMatchRow));
});

// GET /v1/matches/:matchId
match.get("/:matchId", async (c) => {
  const userId = c.get("userId");
  const matchId = c.req.param("matchId");

  const row = await c.env.DB.prepare(`
    ${MATCH_LIST_QUERY}
    WHERE m.id = ?2
      AND (m.user_low_id = ?1 OR m.user_high_id = ?1)
    LIMIT 1
  `).bind(userId, matchId).first();

  if (!row) {
    throw new NotFoundError("match_not_found");
  }

  return c.json(mapMatchRow(row));
});

// POST /v1/matches/resolve
match.post("/resolve", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const targetUserId = body.targetUserId;

  // Check for mutual positive swipe
  const mutualSwipe = await c.env.DB.prepare(
    `SELECT 1 FROM swipes WHERE actor_user_id = ? AND target_user_id = ? AND direction IN ('right', 'super') LIMIT 1`
  ).bind(targetUserId, userId).first();

  if (!mutualSwipe) {
    return c.json({ created: false, isMutualLike: false, match: null, notificationEvent: null });
  }

  const lowId = Math.min(Number(userId), Number(targetUserId));
  const highId = Math.max(Number(userId), Number(targetUserId));

  // Create or reactivate match
  const insertedMatch = await c.env.DB.prepare(`
    INSERT INTO matches (user_low_id, user_high_id, status)
    VALUES (?, ?, 'active')
    ON CONFLICT (user_low_id, user_high_id)
    DO UPDATE SET status = 'active', unmatched_at = NULL, updated_at = datetime('now')
    RETURNING id
  `).bind(lowId, highId).first<{ id: number }>();

  if (!insertedMatch) {
    return c.json({ created: false, isMutualLike: true, match: null, notificationEvent: null });
  }

  // Create conversation
  await c.env.DB.prepare(`
    INSERT INTO conversations (match_id, started_by_user_id, status)
    VALUES (?, ?, 'active')
    ON CONFLICT (match_id)
    DO UPDATE SET status = 'active', updated_at = datetime('now')
  `).bind(insertedMatch.id, userId).run();

  // Hydrate the match
  const hydrated = await c.env.DB.prepare(`
    ${MATCH_LIST_QUERY}
    WHERE m.id = ?2
      AND (m.user_low_id = ?1 OR m.user_high_id = ?1)
    LIMIT 1
  `).bind(userId, insertedMatch.id).first();

  const matchItem = hydrated ? mapMatchRow(hydrated) : null;

  return c.json({
    created: true,
    isMutualLike: true,
    match: matchItem,
    notificationEvent: matchItem
      ? {
          type: "match.created",
          matchId: matchItem.matchId,
          recipientUserIds: [userId, targetUserId]
        }
      : null
  }, 201);
});

export default match;
