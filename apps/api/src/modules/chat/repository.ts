import type { FastifyInstance } from "fastify";
import type { PoolClient } from "pg";
import { ForbiddenError } from "../../common/errors.js";
import type { ConversationMessage, ConversationSummary, SendMessageBody } from "./schema.js";
import type { ChatSafetyAssessment } from "./safety.js";

type ConversationRow = {
  conversation_id: string;
  match_id: string;
  status: "active" | "archived" | "blocked";
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  unread_count: number;
  peer_user_id: string;
  peer_display_name: string;
  peer_birth_date: string;
  peer_bio: string | null;
  peer_city: string | null;
  peer_country_code: string | null;
  peer_primary_photo_url: string | null;
  last_message_id: string | null;
  last_message_sender_user_id: string | null;
  last_message_type: "text" | "image" | "system" | null;
  last_message_body: string | null;
  last_message_media_storage_key: string | null;
  last_message_created_at: string | null;
};

type MessageRow = {
  message_id: string;
  conversation_id: string;
  sender_user_id: string;
  message_type: "text" | "image" | "system";
  body: string | null;
  media_storage_key: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  moderation_status: "approved" | "pending" | "review" | "blocked";
  delivery_status: "sent" | "delivered" | "read";
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
  message_risk_score: number | null;
  user_risk_score: number | null;
  risk_action: "allow" | "mark_review" | "throttle_sender" | "block_message" | "escalate_moderation" | null;
  risk_labels: string[] | null;
  risk_dangerous: boolean | null;
};

type ConversationAccessRow = {
  allowed: boolean;
  peer_user_id: string;
};

type CounterRow = {
  unread_count: number;
};

type MessageSafetyContextRow = {
  duplicate_messages_last_hour: number;
  sender_reports_last_24h: number;
};

type UserCommunicationRiskRow = {
  user_risk_score: string;
};

export class ChatRepository {
  constructor(private readonly app: FastifyInstance) {}

  private calculateAge(birthDate: string) {
    const now = new Date();
    const date = new Date(birthDate);
    let age = now.getUTCFullYear() - date.getUTCFullYear();
    const monthOffset = now.getUTCMonth() - date.getUTCMonth();
    if (monthOffset < 0 || (monthOffset === 0 && now.getUTCDate() < date.getUTCDate())) {
      age -= 1;
    }
    return age;
  }

  private mapConversation(row: ConversationRow): ConversationSummary {
    return {
      conversationId: row.conversation_id,
      matchId: row.match_id,
      status: row.status,
      unreadCount: Number(row.unread_count),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastMessageAt: row.last_message_at,
      peer: {
        userId: row.peer_user_id,
        displayName: row.peer_display_name,
        age: this.calculateAge(row.peer_birth_date),
        bio: row.peer_bio,
        city: row.peer_city,
        countryCode: row.peer_country_code,
        primaryPhotoUrl: row.peer_primary_photo_url
      },
      lastMessage: row.last_message_id
        ? {
            messageId: row.last_message_id,
            senderUserId: row.last_message_sender_user_id ?? "",
            messageType: row.last_message_type ?? "text",
            body: row.last_message_body,
            mediaStorageKey: row.last_message_media_storage_key,
            createdAt: row.last_message_created_at ?? row.updated_at
          }
        : null
    };
  }

  private mapMessage(row: MessageRow): ConversationMessage {
    return {
      messageId: row.message_id,
      conversationId: row.conversation_id,
      senderUserId: row.sender_user_id,
      messageType: row.message_type,
      body: row.body,
      attachment: row.media_storage_key
        ? {
            storageKey: row.media_storage_key,
            mimeType: row.mime_type,
            sizeBytes: row.size_bytes
          }
        : null,
      moderationStatus: row.moderation_status,
      deliveryStatus: row.delivery_status,
      deliveredAt: row.delivered_at,
      readAt: row.read_at,
      createdAt: row.created_at,
      riskAssessment:
        row.message_risk_score !== null && row.user_risk_score !== null && row.risk_action
          ? {
              messageRiskScore: Number(row.message_risk_score),
              userRiskScore: Number(row.user_risk_score),
              action: row.risk_action,
              labels: (row.risk_labels ?? []) as Array<
                "money_request" | "external_contact_shift" | "suspicious_link" | "mass_duplicate_message" | "romance_scam_pattern"
              >,
              dangerous: Boolean(row.risk_dangerous)
            }
          : null
    };
  }

  async getMessageSafetyContext(senderUserId: string, body: string | undefined) {
    const duplicateResult = await this.app.db.query<MessageSafetyContextRow>(
      `select
         coalesce((
           select count(*)::int
           from messages msg
           where msg.sender_user_id = $1::bigint
             and msg.body = $2
             and msg.created_at >= now() - interval '1 hour'
         ), 0) as duplicate_messages_last_hour,
         coalesce((
           select count(*)::int
           from reports r
           where r.target_user_id = $1::bigint
             and r.created_at >= now() - interval '24 hours'
         ), 0) as sender_reports_last_24h`,
      [senderUserId, body ?? null]
    );

    return {
      duplicateMessagesLastHour: Number(duplicateResult.rows[0]?.duplicate_messages_last_hour ?? 0),
      senderReportsLast24h: Number(duplicateResult.rows[0]?.sender_reports_last_24h ?? 0)
    };
  }

  async assertConversationAccess(conversationId: string, userId: string, client?: PoolClient) {
    const executor = client ?? this.app.db;
    const result = await executor.query<ConversationAccessRow>(
      `select
         exists(
           select 1
           from conversations c
           join matches m on m.id = c.match_id
           where c.id = $1::bigint
             and c.status = 'active'
             and m.status = 'active'
             and $2::bigint in (m.user_low_id, m.user_high_id)
         ) as allowed,
         (
           select case
             when m.user_low_id = $2::bigint then m.user_high_id::text
             else m.user_low_id::text
           end
           from conversations c
           join matches m on m.id = c.match_id
           where c.id = $1::bigint
             and $2::bigint in (m.user_low_id, m.user_high_id)
           limit 1
         ) as peer_user_id`,
      [conversationId, userId]
    );

    const access = result.rows[0];
    if (!access?.allowed) {
      throw new ForbiddenError("conversation_access_denied");
    }

    return {
      peerUserId: access.peer_user_id
    };
  }

  async listConversations(userId: string) {
    const [itemsResult, unreadResult] = await Promise.all([
      this.app.db.query<ConversationRow>(
        `select
           c.id::text as conversation_id,
           m.id::text as match_id,
           c.status,
           c.created_at::text,
           c.updated_at::text,
           c.last_message_at::text,
           coalesce(unread.unread_count, 0)::int as unread_count,
           peer.id::text as peer_user_id,
           p.display_name as peer_display_name,
           p.birth_date::text as peer_birth_date,
           p.bio as peer_bio,
           p.city as peer_city,
           p.country_code as peer_country_code,
           pp.cdn_url as peer_primary_photo_url,
           lm.id::text as last_message_id,
           lm.sender_user_id::text as last_message_sender_user_id,
           lm.message_type as last_message_type,
           lm.body as last_message_body,
           lm.media_storage_key as last_message_media_storage_key,
           lm.created_at::text as last_message_created_at
         from conversations c
         join matches m
           on m.id = c.match_id
          and m.status = 'active'
         join users peer
           on peer.id = case
             when m.user_low_id = $1::bigint then m.user_high_id
             else m.user_low_id
           end
         join profiles p on p.user_id = peer.id
         left join profile_photos pp
           on pp.user_id = peer.id
          and pp.is_primary = true
          and pp.deleted_at is null
         left join messages lm on lm.id = c.last_message_id
         left join lateral (
           select count(*)::int as unread_count
           from messages unread_messages
           where unread_messages.conversation_id = c.id
             and unread_messages.sender_user_id <> $1::bigint
             and unread_messages.read_at is null
             and unread_messages.deleted_at is null
         ) unread on true
         where $1::bigint in (m.user_low_id, m.user_high_id)
           and c.status = 'active'
         order by coalesce(c.last_message_at, c.created_at) desc`,
        [userId]
      ),
      this.app.db.query<CounterRow>(
        `select coalesce(count(*), 0)::int as unread_count
         from messages msg
         join conversations c on c.id = msg.conversation_id
         join matches m on m.id = c.match_id
         where $1::bigint in (m.user_low_id, m.user_high_id)
           and m.status = 'active'
           and c.status = 'active'
           and msg.sender_user_id <> $1::bigint
           and msg.read_at is null
           and msg.deleted_at is null`,
        [userId]
      )
    ]);

    return {
      items: itemsResult.rows.map((row) => this.mapConversation(row)),
      totalUnreadCount: Number(unreadResult.rows[0]?.unread_count ?? 0)
    };
  }

  async listMessages(conversationId: string, userId: string, cursor: string | undefined, limit: number) {
    await this.assertConversationAccess(conversationId, userId);

    const result = await this.app.db.query<MessageRow>(
      `with cursor_message as (
         select id, created_at
         from messages
         where id = $3::bigint
           and conversation_id = $1::bigint
         limit 1
       )
       select
         msg.id::text as message_id,
         msg.conversation_id::text,
         msg.sender_user_id::text,
         msg.message_type,
         msg.body,
         msg.media_storage_key,
         null::text as mime_type,
         null::int as size_bytes,
         msg.moderation_status,
         msg.delivery_status,
         msg.delivered_at::text,
         msg.read_at::text,
         msg.created_at::text,
         mra.message_risk_score,
         mra.user_risk_score,
         mra.action as risk_action,
         mra.labels as risk_labels,
         mra.dangerous as risk_dangerous
       from messages msg
       left join message_risk_assessments mra on mra.message_id = msg.id
       where msg.conversation_id = $1::bigint
         and msg.deleted_at is null
         and (
           $3::bigint is null
           or msg.created_at < (select created_at from cursor_message)
           or (
             msg.created_at = (select created_at from cursor_message)
             and msg.id < (select id from cursor_message)
           )
         )
       order by msg.created_at desc, msg.id desc
       limit $2 + 1`,
      [conversationId, limit, cursor ?? null]
    );

    const hasMore = result.rows.length > limit;
    const page = hasMore ? result.rows.slice(0, limit) : result.rows;
    const nextCursor = hasMore ? page[page.length - 1]?.message_id ?? null : null;

    return {
      items: page.reverse().map((row) => this.mapMessage(row)),
      nextCursor,
      hasMore
    };
  }

  async sendMessage(
    conversationId: string,
    senderUserId: string,
    payload: SendMessageBody,
    assessment: ChatSafetyAssessment
  ) {
    const client = await this.app.db.connect();

    try {
      await client.query("begin");

      const access = await this.assertConversationAccess(conversationId, senderUserId, client);

      const inserted = await client.query<MessageRow>(
        `insert into messages (
           conversation_id,
           sender_user_id,
           message_type,
           body,
           media_storage_key,
           moderation_status,
           delivery_status,
           created_at,
           updated_at
         )
         values (
           $1::bigint,
           $2::bigint,
           $3,
           $4,
           $5,
           $6,
           'sent',
           now(),
           now()
         )
         returning
           id::text as message_id,
           conversation_id::text,
           sender_user_id::text,
           message_type,
           body,
           media_storage_key,
           null::text as mime_type,
           null::int as size_bytes,
           moderation_status,
           delivery_status,
           delivered_at::text,
           read_at::text,
           created_at::text,
           null::numeric as message_risk_score,
           null::numeric as user_risk_score,
           null::text as risk_action,
           null::text[] as risk_labels,
           null::boolean as risk_dangerous`,
        [
          conversationId,
          senderUserId,
          payload.messageType,
          payload.body ?? null,
          payload.attachment?.storageKey ?? null,
          assessment.moderationStatus
        ]
      );

      const message = inserted.rows[0];

      const riskScoreResult = await client.query<UserCommunicationRiskRow>(
        `insert into user_communication_risk_scores (
           user_id,
           risk_score,
           last_message_risk_score,
           review_status,
           updated_at,
           created_at
         )
         values (
           $1::bigint,
           $2,
           $3,
           $4,
           now(),
           now()
         )
         on conflict (user_id)
         do update set
           risk_score = least(100, user_communication_risk_scores.risk_score + $2),
           last_message_risk_score = $3,
           review_status = $4,
           updated_at = now()
         returning risk_score::text as user_risk_score`,
        [
          senderUserId,
          assessment.userRiskScoreDelta,
          assessment.messageRiskScore,
          assessment.action === "block_message" || assessment.action === "escalate_moderation"
            ? "needs_review"
            : assessment.action === "mark_review"
              ? "watch"
              : "clear"
        ]
      );

      const userRiskScore = Number(riskScoreResult.rows[0]?.user_risk_score ?? assessment.userRiskScoreDelta);

      await client.query(
        `insert into message_risk_assessments (
           message_id,
           user_id,
           message_risk_score,
           user_risk_score,
           action,
           labels,
           reasons,
           dangerous,
           created_at
         )
         values ($1::bigint, $2::bigint, $3, $4, $5, $6::text[], $7::text[], $8, now())`,
        [
          message.message_id,
          senderUserId,
          assessment.messageRiskScore,
          userRiskScore,
          assessment.action,
          assessment.labels,
          assessment.reasons,
          assessment.dangerous
        ]
      );

      if (assessment.action === "escalate_moderation" || assessment.action === "block_message") {
        await client.query(
          `insert into moderation_escalations (
             user_id,
             source,
             reason,
             status,
             recommended_action,
             payload,
             created_at,
             updated_at
           )
           values ($1::bigint, 'chat', $2, 'open', 'manual_review', $3::jsonb, now(), now())`,
          [
            senderUserId,
            assessment.action === "block_message" ? "blocked_chat_message" : "flagged_chat_message",
            JSON.stringify({
              messageId: message.message_id,
              conversationId,
              labels: assessment.labels,
              messageRiskScore: assessment.messageRiskScore,
              userRiskScore
            })
          ]
        );
      }

      await client.query(
        `update conversations
         set last_message_id = $2::bigint,
             last_message_at = now(),
             updated_at = now()
         where id = $1::bigint`,
        [conversationId, message.message_id]
      );

      await client.query("commit");

      return {
        message: this.mapMessage({
          ...message,
          message_risk_score: assessment.messageRiskScore,
          user_risk_score: userRiskScore,
          risk_action: assessment.action,
          risk_labels: assessment.labels,
          risk_dangerous: assessment.dangerous
        }),
        assessment: {
          ...assessment,
          userRiskScore
        },
        peerUserId: access.peerUserId
      };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async markConversationRead(conversationId: string, userId: string) {
    await this.assertConversationAccess(conversationId, userId);

    const result = await this.app.db.query<{ id: string }>(
      `update messages
       set read_at = now(),
           delivery_status = 'read',
           delivered_at = coalesce(delivered_at, now()),
           updated_at = now()
       where conversation_id = $1::bigint
         and sender_user_id <> $2::bigint
         and read_at is null
         and deleted_at is null
       returning id::text as id`,
      [conversationId, userId]
    );

    return result.rowCount ?? 0;
  }

  async getUnreadCount(userId: string) {
    const result = await this.app.db.query<CounterRow>(
      `select coalesce(count(*), 0)::int as unread_count
       from messages msg
       join conversations c on c.id = msg.conversation_id
       join matches m on m.id = c.match_id
       where $1::bigint in (m.user_low_id, m.user_high_id)
         and m.status = 'active'
         and c.status = 'active'
         and msg.sender_user_id <> $1::bigint
         and msg.read_at is null
         and msg.deleted_at is null`,
      [userId]
    );

    return Number(result.rows[0]?.unread_count ?? 0);
  }
}
