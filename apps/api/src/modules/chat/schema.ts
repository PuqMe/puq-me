import { z } from "zod";

export const conversationIdParamsSchema = z.object({
  conversationId: z.string().regex(/^\d+$/)
});

export const listMessagesQuerySchema = z.object({
  cursor: z.string().regex(/^\d+$/).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30)
});

export const sendMessageBodySchema = z
  .object({
    conversationId: z.string().regex(/^\d+$/),
    messageType: z.enum(["text", "image"]).default("text"),
    body: z.string().trim().max(4000).optional(),
    attachment: z
      .object({
        storageKey: z.string().min(1),
        mimeType: z.string().min(1).max(100),
        sizeBytes: z.number().int().positive().max(25 * 1024 * 1024)
      })
      .optional()
  })
  .superRefine((value, ctx) => {
    if (value.messageType === "text" && !value.body) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "text_message_body_required",
        path: ["body"]
      });
    }

    if (value.messageType === "image" && !value.attachment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "image_attachment_required",
        path: ["attachment"]
      });
    }
  });

export const markConversationReadBodySchema = z.object({
  conversationId: z.string().regex(/^\d+$/)
});

export const chatPeerSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  age: z.number().int().nonnegative(),
  bio: z.string().nullable(),
  city: z.string().nullable(),
  countryCode: z.string().nullable(),
  primaryPhotoUrl: z.string().nullable()
});

export const chatSafetyActionSchema = z.enum([
  "allow",
  "mark_review",
  "throttle_sender",
  "block_message",
  "escalate_moderation"
]);

export const chatSafetyLabelSchema = z.enum([
  "money_request",
  "external_contact_shift",
  "suspicious_link",
  "mass_duplicate_message",
  "romance_scam_pattern"
]);

export const conversationSummarySchema = z.object({
  conversationId: z.string(),
  matchId: z.string(),
  status: z.enum(["active", "archived", "blocked"]),
  unreadCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastMessageAt: z.string().nullable(),
  peer: chatPeerSchema,
  lastMessage: z
    .object({
      messageId: z.string(),
      senderUserId: z.string(),
      messageType: z.enum(["text", "image", "system"]),
      body: z.string().nullable(),
      mediaStorageKey: z.string().nullable(),
      createdAt: z.string()
    })
    .nullable()
});

export const conversationMessageSchema = z.object({
  messageId: z.string(),
  conversationId: z.string(),
  senderUserId: z.string(),
  messageType: z.enum(["text", "image", "system"]),
  body: z.string().nullable(),
  attachment: z
    .object({
      storageKey: z.string(),
      mimeType: z.string().nullable(),
      sizeBytes: z.number().int().nullable()
    })
    .nullable(),
  moderationStatus: z.enum(["approved", "pending", "review", "blocked"]),
  deliveryStatus: z.enum(["sent", "delivered", "read"]),
  deliveredAt: z.string().nullable(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
  riskAssessment: z
    .object({
      messageRiskScore: z.number().nonnegative(),
      userRiskScore: z.number().nonnegative(),
      action: chatSafetyActionSchema,
      labels: z.array(chatSafetyLabelSchema),
      dangerous: z.boolean()
    })
    .nullable()
});

export const listConversationsResponseSchema = z.object({
  items: z.array(conversationSummarySchema),
  meta: z.object({
    totalUnreadCount: z.number().int().nonnegative()
  })
});

export const listMessagesResponseSchema = z.object({
  items: z.array(conversationMessageSchema),
  meta: z.object({
    nextCursor: z.string().nullable(),
    hasMore: z.boolean()
  })
});

export const sendMessageResponseSchema = z.object({
  message: conversationMessageSchema,
  websocketEvent: z
    .object({
      type: z.literal("chat.message.created"),
      conversationId: z.string(),
      recipientUserIds: z.array(z.string())
    })
    .nullable(),
  moderationEvent: z
    .object({
      type: z.literal("chat.message.flagged"),
      messageId: z.string(),
      senderUserId: z.string(),
      action: chatSafetyActionSchema
    })
    .nullable()
});

export const markConversationReadResponseSchema = z.object({
  conversationId: z.string(),
  updatedCount: z.number().int().nonnegative(),
  websocketEvent: z.object({
    type: z.literal("chat.messages.read"),
    conversationId: z.string(),
    actorUserId: z.string()
  })
});

export const unreadCounterResponseSchema = z.object({
  unreadCount: z.number().int().nonnegative()
});

export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
export type SendMessageBody = z.infer<typeof sendMessageBodySchema>;
export type MarkConversationReadBody = z.infer<typeof markConversationReadBodySchema>;
export type ConversationSummary = z.infer<typeof conversationSummarySchema>;
export type ConversationMessage = z.infer<typeof conversationMessageSchema>;
