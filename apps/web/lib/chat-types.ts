export type ChatMessage = {
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
  deliveredAt?: string | null;
  readAt?: string | null;
};

export type ChatSocketEvent =
  | {
      type: "message.created";
      payload: ChatMessage;
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
