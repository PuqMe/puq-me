import { z } from "zod";

export const matchIdParamsSchema = z.object({
  matchId: z.string().regex(/^\d+$/)
});

export const resolveMatchBodySchema = z.object({
  targetUserId: z.string().regex(/^\d+$/)
});

export const matchPeerSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  age: z.number().int().nonnegative(),
  bio: z.string().nullable(),
  city: z.string().nullable(),
  countryCode: z.string().nullable(),
  primaryPhotoUrl: z.string().nullable()
});

export const matchConversationSchema = z.object({
  conversationId: z.string().nullable(),
  lastMessageAt: z.string().nullable()
});

export const matchItemSchema = z.object({
  matchId: z.string(),
  status: z.enum(["active", "unmatched", "blocked"]),
  matchedAt: z.string(),
  peer: matchPeerSchema,
  conversation: matchConversationSchema
});

export const resolveMatchResponseSchema = z.object({
  created: z.boolean(),
  isMutualLike: z.boolean(),
  match: matchItemSchema.nullable(),
  notificationEvent: z
    .object({
      type: z.literal("match.created"),
      matchId: z.string(),
      recipientUserIds: z.array(z.string())
    })
    .nullable()
});

export type MatchIdParams = z.infer<typeof matchIdParamsSchema>;
export type ResolveMatchBody = z.infer<typeof resolveMatchBodySchema>;
export type MatchItem = z.infer<typeof matchItemSchema>;
