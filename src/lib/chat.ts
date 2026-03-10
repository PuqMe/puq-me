import type { FastifyInstance } from "fastify";

export type ChatEvent =
  | {
      type: "message.created";
      payload: ChatMessagePayload;
    }
  | {
      type: "message.status";
      payload: {
        threadId: number;
        messageId: number;
        userId: string;
        status: "delivered" | "read";
        updatedAt: string;
      };
    }
  | {
      type: "typing";
      payload: {
        threadId: number;
        userId: string;
        isTyping: boolean;
        expiresAt: string;
      };
    }
  | {
      type: "presence";
      payload: {
        threadId: number;
        userId: string;
        state: "online" | "offline";
        updatedAt: string;
      };
    };

export type ChatMessagePayload = {
  id: number;
  threadId: number;
  senderUserId: string;
  senderPublicId?: string;
  messageType: "text" | "image";
  body: string | null;
  imageUrl: string | null;
  moderationStatus: string;
  deliveryStatus: "sent" | "delivered" | "read";
  sentAt: string;
};

export async function isThreadParticipant(app: FastifyInstance, threadId: number, userId: string): Promise<boolean> {
  const membership = await app.db.query(
    `select 1
     from chat_threads t
     join matches m on m.id = t.match_id
     where t.id = $1
       and (m.user_low_id = $2 or m.user_high_id = $2)
     limit 1`,
    [threadId, userId]
  );

  return membership.rowCount > 0;
}

export async function publishChatEvent(app: FastifyInstance, threadId: number, event: ChatEvent): Promise<void> {
  await app.redis.publish(`thread:${threadId}:events`, JSON.stringify(event));
}

export async function setPresence(app: FastifyInstance, threadId: number, userId: string, state: "online" | "offline") {
  const key = `presence:thread:${threadId}:${userId}`;

  if (state === "online") {
    await app.redis.set(key, "1", "EX", 60);
  } else {
    await app.redis.del(key);
  }

  await publishChatEvent(app, threadId, {
    type: "presence",
    payload: {
      threadId,
      userId,
      state,
      updatedAt: new Date().toISOString()
    }
  });
}

export async function publishTyping(app: FastifyInstance, threadId: number, userId: string, isTyping: boolean) {
  const key = `typing:thread:${threadId}:${userId}`;

  if (isTyping) {
    await app.redis.set(key, "1", "EX", app.config.WEBSOCKET_TYPING_TTL_SECONDS);
  } else {
    await app.redis.del(key);
  }

  await publishChatEvent(app, threadId, {
    type: "typing",
    payload: {
      threadId,
      userId,
      isTyping,
      expiresAt: new Date(Date.now() + app.config.WEBSOCKET_TYPING_TTL_SECONDS * 1000).toISOString()
    }
  });
}
