import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { containsSuspiciousText, guardActionRate } from "../lib/spam.js";
import { isThreadParticipant, publishChatEvent, type ChatMessagePayload } from "../lib/chat.js";

const sendMessageSchema = z.object({
  threadId: z.number().int().positive(),
  messageType: z.enum(["text", "image"]).default("text"),
  body: z.string().max(4000).nullable().optional(),
  imageUrl: z.string().url().nullable().optional()
});

const statusSchema = z.object({
  threadId: z.number().int().positive(),
  messageId: z.number().int().positive(),
  status: z.enum(["delivered", "read"])
});

const chatRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.authenticate);

  app.get("/threads/:threadId/messages", async (request, reply) => {
    const params = z.object({ threadId: z.coerce.number().int().positive() }).parse(request.params);
    if (!(await isThreadParticipant(app, params.threadId, request.user.sub))) {
      return reply.forbidden("not_a_participant");
    }

    const result = await app.db.query(
      `select m.id,
              m.thread_id,
              m.sender_user_id,
              u.public_id as sender_public_id,
              m.message_type,
              m.body,
              m.image_url,
              m.moderation_status,
              m.delivery_status,
              m.sent_at,
              m.delivered_at,
              m.read_at
       from messages m
       join users u on u.id = m.sender_user_id
       where thread_id = $1
       order by sent_at desc
       limit 50`,
      [params.threadId]
    );

    return {
      items: result.rows.reverse().map((row) => ({
        id: row.id,
        threadId: row.thread_id,
        senderUserId: String(row.sender_user_id),
        senderPublicId: row.sender_public_id,
        messageType: row.message_type,
        body: row.body,
        imageUrl: row.image_url,
        moderationStatus: row.moderation_status,
        deliveryStatus: row.delivery_status,
        sentAt: row.sent_at,
        deliveredAt: row.delivered_at,
        readAt: row.read_at
      }))
    };
  });

  app.post("/messages", async (request, reply) => {
    const payload = sendMessageSchema.parse(request.body);
    if (payload.messageType === "text" && !payload.body?.trim()) {
      return reply.badRequest("text_body_required");
    }
    if (payload.messageType === "image" && !payload.imageUrl) {
      return reply.badRequest("image_url_required");
    }

    await guardActionRate(
      app,
      `ratelimit:messages:${request.user.sub}`,
      app.config.MESSAGE_RATE_LIMIT,
      60
    );

    if (!(await isThreadParticipant(app, payload.threadId, request.user.sub))) {
      return reply.forbidden("not_a_participant");
    }

    const moderationStatus =
      payload.messageType === "text" && payload.body && containsSuspiciousText(payload.body) ? "review" : "approved";

    const result = await app.db.query(
      `with inserted as (
           insert into messages (thread_id, sender_user_id, message_type, body, image_url, moderation_status, delivery_status)
           values ($1, $2, $3, $4, $5, $6, 'sent')
           returning id, thread_id, sender_user_id, message_type, body, image_url, moderation_status, delivery_status, sent_at
       )
       update chat_threads
       set last_message_at = now()
       where id = $1
       returning (select row_to_json(enriched)
                  from (
                    select i.*,
                           u.public_id as sender_public_id
                    from inserted i
                    join users u on u.id = i.sender_user_id
                  ) enriched) as message`,
      [
        payload.threadId,
        request.user.sub,
        payload.messageType,
        payload.body?.trim() ?? null,
        payload.imageUrl ?? null,
        moderationStatus
      ]
    );

    const message = {
      id: result.rows[0].message.id,
      threadId: result.rows[0].message.thread_id,
      senderUserId: String(result.rows[0].message.sender_user_id),
      senderPublicId: result.rows[0].message.sender_public_id,
      messageType: result.rows[0].message.message_type,
      body: result.rows[0].message.body,
      imageUrl: result.rows[0].message.image_url,
      moderationStatus: result.rows[0].message.moderation_status,
      deliveryStatus: result.rows[0].message.delivery_status,
      sentAt: result.rows[0].message.sent_at
    } satisfies ChatMessagePayload;
    await publishChatEvent(app, payload.threadId, {
      type: "message.created",
      payload: message
    });

    return reply.code(201).send(message);
  });

  app.post("/messages/status", async (request, reply) => {
    const payload = statusSchema.parse(request.body);

    if (!(await isThreadParticipant(app, payload.threadId, request.user.sub))) {
      return reply.forbidden("not_a_participant");
    }

    const statusResult = await app.db.query(
      `update messages
       set delivery_status = case
            when $4 = 'read' then 'read'
            when delivery_status = 'sent' and $4 = 'delivered' then 'delivered'
            else delivery_status
           end,
           delivered_at = case
            when $4 in ('delivered', 'read') and delivered_at is null then now()
            else delivered_at
           end,
           read_at = case
            when $4 = 'read' and read_at is null then now()
            else read_at
           end
       where id = $1
         and thread_id = $2
         and sender_user_id <> $3
       returning id, thread_id, delivery_status, coalesce(read_at, delivered_at, now()) as updated_at`,
      [payload.messageId, payload.threadId, request.user.sub, payload.status]
    );

    if (!statusResult.rowCount) {
      return reply.notFound("message_not_found");
    }

    const event = {
      type: "message.status" as const,
      payload: {
        threadId: statusResult.rows[0].thread_id,
        messageId: statusResult.rows[0].id,
        userId: request.user.sub,
        status: statusResult.rows[0].delivery_status,
        updatedAt: statusResult.rows[0].updated_at
      }
    };

    await publishChatEvent(app, payload.threadId, event);
    return reply.code(202).send(event.payload);
  });
};

export default chatRoutes;
