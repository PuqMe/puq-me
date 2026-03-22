import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";
import { ForbiddenError } from "../lib/errors.js";
import { assessChatMessageSafety } from "../lib/safety.js";

const chat = new Hono<AppContext>();

chat.use("/*", auth);

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

async function assertConversationAccess(db: D1Database, conversationId: string, userId: string) {
  const access = await db.prepare(`
    SELECT
      CASE
        WHEN m.user_low_id = ?2 THEN m.user_high_id
        ELSE m.user_low_id
      END as peer_user_id
    FROM conversations c
    JOIN matches m ON m.id = c.match_id
    WHERE c.id = ?1
      AND c.status = 'active'
      AND m.status = 'active'
      AND (?2 IN (m.user_low_id, m.user_high_id))
    LIMIT 1
  `).bind(conversationId, userId).first<{ peer_user_id: number }>();

  if (!access) {
    throw new ForbiddenError("conversation_access_denied");
  }

  return { peerUserId: String(access.peer_user_id) };
}

// GET /v1/chat/conversations
chat.get("/conversations", async (c) => {
  const userId = c.get("userId");

  const results = await c.env.DB.prepare(`
    SELECT
      c.id as conversation_id,
      m.id as match_id,
      c.status,
      c.created_at,
      c.updated_at,
      c.last_message_at,
      (
        SELECT COUNT(*)
        FROM messages unread_msg
        WHERE unread_msg.conversation_id = c.id
          AND unread_msg.sender_user_id <> ?1
          AND unread_msg.read_at IS NULL
          AND unread_msg.deleted_at IS NULL
      ) as unread_count,
      peer.id as peer_user_id,
      p.display_name as peer_display_name,
      p.birth_date as peer_birth_date,
      p.bio as peer_bio,
      p.city as peer_city,
      p.country_code as peer_country_code,
      pp.cdn_url as peer_primary_photo_url,
      lm.id as last_message_id,
      lm.sender_user_id as last_message_sender_user_id,
      lm.message_type as last_message_type,
      lm.body as last_message_body,
      lm.media_storage_key as last_message_media_storage_key,
      lm.created_at as last_message_created_at
    FROM conversations c
    JOIN matches m ON m.id = c.match_id AND m.status = 'active'
    JOIN users peer ON peer.id = CASE WHEN m.user_low_id = ?1 THEN m.user_high_id ELSE m.user_low_id END
    JOIN profiles p ON p.user_id = peer.id
    LEFT JOIN profile_photos pp ON pp.user_id = peer.id AND pp.is_primary = 1 AND pp.deleted_at IS NULL
    LEFT JOIN messages lm ON lm.id = c.last_message_id
    WHERE (?1 IN (m.user_low_id, m.user_high_id))
      AND c.status = 'active'
    ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
  `).bind(userId).all();

  // Total unread count
  const unreadResult = await c.env.DB.prepare(`
    SELECT COUNT(*) as unread_count
    FROM messages msg
    JOIN conversations c ON c.id = msg.conversation_id
    JOIN matches m ON m.id = c.match_id
    WHERE (?1 IN (m.user_low_id, m.user_high_id))
      AND m.status = 'active'
      AND c.status = 'active'
      AND msg.sender_user_id <> ?1
      AND msg.read_at IS NULL
      AND msg.deleted_at IS NULL
  `).bind(userId).first<{ unread_count: number }>();

  return c.json({
    items: (results.results ?? []).map((row: any) => ({
      conversationId: String(row.conversation_id),
      matchId: String(row.match_id),
      status: row.status,
      unreadCount: Number(row.unread_count),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastMessageAt: row.last_message_at,
      peer: {
        userId: String(row.peer_user_id),
        displayName: row.peer_display_name,
        age: calculateAge(row.peer_birth_date),
        bio: row.peer_bio,
        city: row.peer_city,
        countryCode: row.peer_country_code,
        primaryPhotoUrl: row.peer_primary_photo_url
      },
      lastMessage: row.last_message_id
        ? {
            messageId: String(row.last_message_id),
            senderUserId: String(row.last_message_sender_user_id),
            messageType: row.last_message_type ?? "text",
            body: row.last_message_body,
            mediaStorageKey: row.last_message_media_storage_key,
            createdAt: row.last_message_created_at ?? row.updated_at
          }
        : null
    })),
    meta: { totalUnreadCount: Number(unreadResult?.unread_count ?? 0) }
  });
});

// GET /v1/chat/conversations/unread-count
chat.get("/conversations/unread-count", async (c) => {
  const userId = c.get("userId");

  const result = await c.env.DB.prepare(`
    SELECT COUNT(*) as unread_count
    FROM messages msg
    JOIN conversations c ON c.id = msg.conversation_id
    JOIN matches m ON m.id = c.match_id
    WHERE (?1 IN (m.user_low_id, m.user_high_id))
      AND m.status = 'active'
      AND c.status = 'active'
      AND msg.sender_user_id <> ?1
      AND msg.read_at IS NULL
      AND msg.deleted_at IS NULL
  `).bind(userId).first<{ unread_count: number }>();

  return c.json({ unreadCount: Number(result?.unread_count ?? 0) });
});

// GET /v1/chat/conversations/:conversationId/messages
chat.get("/conversations/:conversationId/messages", async (c) => {
  const userId = c.get("userId");
  const conversationId = c.req.param("conversationId");
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") ?? "20", 10);

  await assertConversationAccess(c.env.DB, conversationId, userId);

  let query: string;
  let binds: any[];

  if (cursor) {
    query = `
      SELECT
        msg.id as message_id, msg.conversation_id, msg.sender_user_id, msg.message_type,
        msg.body, msg.media_storage_key, msg.moderation_status, msg.delivery_status,
        msg.delivered_at, msg.read_at, msg.created_at,
        mra.message_risk_score, mra.user_risk_score, mra.action as risk_action,
        mra.labels as risk_labels, mra.dangerous as risk_dangerous
      FROM messages msg
      LEFT JOIN message_risk_assessments mra ON mra.message_id = msg.id
      WHERE msg.conversation_id = ?
        AND msg.deleted_at IS NULL
        AND (msg.created_at < (SELECT created_at FROM messages WHERE id = ? AND conversation_id = ?)
             OR (msg.created_at = (SELECT created_at FROM messages WHERE id = ? AND conversation_id = ?) AND msg.id < ?))
      ORDER BY msg.created_at DESC, msg.id DESC
      LIMIT ?
    `;
    binds = [conversationId, cursor, conversationId, cursor, conversationId, cursor, limit + 1];
  } else {
    query = `
      SELECT
        msg.id as message_id, msg.conversation_id, msg.sender_user_id, msg.message_type,
        msg.body, msg.media_storage_key, msg.moderation_status, msg.delivery_status,
        msg.delivered_at, msg.read_at, msg.created_at,
        mra.message_risk_score, mra.user_risk_score, mra.action as risk_action,
        mra.labels as risk_labels, mra.dangerous as risk_dangerous
      FROM messages msg
      LEFT JOIN message_risk_assessments mra ON mra.message_id = msg.id
      WHERE msg.conversation_id = ?
        AND msg.deleted_at IS NULL
      ORDER BY msg.created_at DESC, msg.id DESC
      LIMIT ?
    `;
    binds = [conversationId, limit + 1];
  }

  const results = await c.env.DB.prepare(query).bind(...binds).all();
  const rows = results.results ?? [];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore && page.length > 0 ? String((page[page.length - 1] as any).message_id) : null;

  return c.json({
    items: page.reverse().map((row: any) => ({
      messageId: String(row.message_id),
      conversationId: String(row.conversation_id),
      senderUserId: String(row.sender_user_id),
      messageType: row.message_type,
      body: row.body,
      attachment: row.media_storage_key
        ? { storageKey: row.media_storage_key, mimeType: null, sizeBytes: null }
        : null,
      moderationStatus: row.moderation_status,
      deliveryStatus: row.delivery_status,
      deliveredAt: row.delivered_at,
      readAt: row.read_at,
      createdAt: row.created_at,
      riskAssessment: row.message_risk_score !== null
        ? {
            messageRiskScore: Number(row.message_risk_score),
            userRiskScore: Number(row.user_risk_score),
            action: row.risk_action,
            labels: row.risk_labels ? JSON.parse(row.risk_labels) : [],
            dangerous: Boolean(row.risk_dangerous)
          }
        : null
    })),
    meta: { nextCursor, hasMore }
  });
});

// POST /v1/chat/messages
chat.post("/messages", async (c) => {
  const userId = c.get("userId");
  const payload = await c.req.json();
  const conversationId = payload.conversationId;

  const access = await assertConversationAccess(c.env.DB, conversationId, userId);

  // Safety context
  const duplicateResult = await c.env.DB.prepare(`
    SELECT COUNT(*) as cnt
    FROM messages
    WHERE sender_user_id = ? AND body = ? AND created_at >= datetime('now', '-1 hour')
  `).bind(userId, payload.body ?? "").first<{ cnt: number }>();

  const reportsResult = await c.env.DB.prepare(`
    SELECT COUNT(*) as cnt
    FROM reports
    WHERE target_user_id = ? AND created_at >= datetime('now', '-1 day')
  `).bind(userId).first<{ cnt: number }>();

  const assessment = assessChatMessageSafety(payload, {
    duplicateMessagesLastHour: Number(duplicateResult?.cnt ?? 0),
    senderReportsLast24h: Number(reportsResult?.cnt ?? 0)
  });

  // Insert message
  const message = await c.env.DB.prepare(`
    INSERT INTO messages (conversation_id, sender_user_id, message_type, body, media_storage_key, moderation_status, delivery_status)
    VALUES (?, ?, ?, ?, ?, ?, 'sent')
    RETURNING id as message_id, conversation_id, sender_user_id, message_type, body, media_storage_key,
              moderation_status, delivery_status, delivered_at, read_at, created_at
  `).bind(
    conversationId,
    userId,
    payload.messageType ?? "text",
    payload.body ?? null,
    payload.attachment?.storageKey ?? null,
    assessment.moderationStatus
  ).first();

  if (!message) throw new Error("Failed to insert message");

  // Update communication risk score
  const riskResult = await c.env.DB.prepare(`
    INSERT INTO user_communication_risk_scores (user_id, risk_score, last_message_risk_score, review_status)
    VALUES (?, ?, ?, ?)
    ON CONFLICT (user_id)
    DO UPDATE SET
      risk_score = MIN(100, user_communication_risk_scores.risk_score + excluded.risk_score),
      last_message_risk_score = excluded.last_message_risk_score,
      review_status = excluded.review_status,
      updated_at = datetime('now')
    RETURNING risk_score as user_risk_score
  `).bind(
    userId,
    assessment.userRiskScoreDelta,
    assessment.messageRiskScore,
    assessment.action === "block_message" || assessment.action === "escalate_moderation"
      ? "needs_review"
      : assessment.action === "mark_review" ? "watch" : "clear"
  ).first<{ user_risk_score: number }>();

  const userRiskScore = Number(riskResult?.user_risk_score ?? assessment.userRiskScoreDelta);

  // Store risk assessment
  await c.env.DB.prepare(`
    INSERT INTO message_risk_assessments (message_id, user_id, message_risk_score, user_risk_score, action, labels, reasons, dangerous)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    (message as any).message_id,
    userId,
    assessment.messageRiskScore,
    userRiskScore,
    assessment.action,
    JSON.stringify(assessment.labels),
    JSON.stringify(assessment.reasons),
    assessment.dangerous ? 1 : 0
  ).run();

  // Create escalation if needed
  if (assessment.action === "escalate_moderation" || assessment.action === "block_message") {
    await c.env.DB.prepare(`
      INSERT INTO moderation_escalations (user_id, source, reason, status, recommended_action, payload)
      VALUES (?, 'chat', ?, 'open', 'manual_review', ?)
    `).bind(
      userId,
      assessment.action === "block_message" ? "blocked_chat_message" : "flagged_chat_message",
      JSON.stringify({
        messageId: String((message as any).message_id),
        conversationId,
        labels: assessment.labels,
        messageRiskScore: assessment.messageRiskScore,
        userRiskScore
      })
    ).run();
  }

  // Update conversation
  await c.env.DB.prepare(`
    UPDATE conversations SET last_message_id = ?, last_message_at = datetime('now'), updated_at = datetime('now') WHERE id = ?
  `).bind((message as any).message_id, conversationId).run();

  return c.json({
    message: {
      messageId: String((message as any).message_id),
      conversationId: String((message as any).conversation_id),
      senderUserId: String((message as any).sender_user_id),
      messageType: (message as any).message_type,
      body: (message as any).body,
      attachment: (message as any).media_storage_key
        ? { storageKey: (message as any).media_storage_key }
        : null,
      moderationStatus: (message as any).moderation_status,
      deliveryStatus: (message as any).delivery_status,
      createdAt: (message as any).created_at
    },
    websocketEvent: assessment.deliverToRecipient
      ? {
          type: "chat.message.created",
          conversationId,
          recipientUserIds: [access.peerUserId]
        }
      : null,
    moderationEvent: assessment.action !== "allow"
      ? {
          type: "chat.message.flagged",
          messageId: String((message as any).message_id),
          senderUserId: userId,
          action: assessment.action
        }
      : null
  }, 201);
});

// POST /v1/chat/conversations/read
chat.post("/conversations/read", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const conversationId = body.conversationId;

  await assertConversationAccess(c.env.DB, conversationId, userId);

  const result = await c.env.DB.prepare(`
    UPDATE messages
    SET read_at = datetime('now'),
        delivery_status = 'read',
        delivered_at = COALESCE(delivered_at, datetime('now')),
        updated_at = datetime('now')
    WHERE conversation_id = ?
      AND sender_user_id <> ?
      AND read_at IS NULL
      AND deleted_at IS NULL
  `).bind(conversationId, userId).run();

  return c.json({
    conversationId,
    updatedCount: result.meta?.changes ?? 0,
    websocketEvent: {
      type: "chat.messages.read",
      conversationId,
      actorUserId: userId
    }
  });
});

export default chat;
