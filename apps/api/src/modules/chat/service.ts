import type { FastifyInstance } from "fastify";
import { ChatRepository } from "./repository.js";
import type { ListMessagesQuery, SendMessageBody } from "./schema.js";
import { assessChatMessageSafety } from "./safety.js";

export class ChatService {
  private readonly repository: ChatRepository;

  constructor(private readonly app: FastifyInstance) {
    this.repository = new ChatRepository(app);
  }

  async listConversations(userId: string) {
    const result = await this.repository.listConversations(userId);

    return {
      items: result.items,
      meta: {
        totalUnreadCount: result.totalUnreadCount
      }
    };
  }

  async listMessages(userId: string, conversationId: string, query: ListMessagesQuery) {
    const result = await this.repository.listMessages(conversationId, userId, query.cursor, query.limit);

    return {
      items: result.items,
      meta: {
        nextCursor: result.nextCursor,
        hasMore: result.hasMore
      }
    };
  }

  async sendMessage(userId: string, payload: SendMessageBody) {
    const context = await this.repository.getMessageSafetyContext(userId, payload.body);
    const assessment = assessChatMessageSafety(payload, context);
    const result = await this.repository.sendMessage(payload.conversationId, userId, payload, assessment);

    this.app.log.info(
      {
        event: "chat.message.created",
        conversationId: payload.conversationId,
        senderUserId: userId,
        recipientUserId: result.peerUserId,
        messageId: result.message.messageId,
        messageRiskScore: result.assessment.messageRiskScore,
        action: result.assessment.action
      },
      "websocket event prepared"
    );

    return {
      message: result.message,
      websocketEvent: result.assessment.deliverToRecipient
        ? {
            type: "chat.message.created" as const,
            conversationId: payload.conversationId,
            recipientUserIds: [result.peerUserId]
          }
        : null,
      moderationEvent:
        result.assessment.action !== "allow"
          ? {
              type: "chat.message.flagged" as const,
              messageId: result.message.messageId,
              senderUserId: userId,
              action: result.assessment.action
            }
          : null
    };
  }

  async markConversationRead(userId: string, conversationId: string) {
    const updatedCount = await this.repository.markConversationRead(conversationId, userId);

    this.app.log.info(
      {
        event: "chat.messages.read",
        conversationId,
        actorUserId: userId,
        updatedCount
      },
      "websocket event prepared"
    );

    return {
      conversationId,
      updatedCount,
      websocketEvent: {
        type: "chat.messages.read" as const,
        conversationId,
        actorUserId: userId
      }
    };
  }

  async getUnreadCount(userId: string) {
    const unreadCount = await this.repository.getUnreadCount(userId);

    return {
      unreadCount
    };
  }
}
