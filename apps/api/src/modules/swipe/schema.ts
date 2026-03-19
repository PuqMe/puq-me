import { z } from "zod";

export const radarQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  refresh: z.coerce.boolean().optional().default(false)
});

export const createSwipeBodySchema = z
  .object({
    targetUserId: z.string().min(1),
    direction: z.enum(["left", "right", "super"])
  })
  .strict();

export const radarFeedItemSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  age: z.number().int(),
  bio: z.string().nullable(),
  city: z.string().nullable(),
  countryCode: z.string().nullable(),
  primaryPhotoUrl: z.string().nullable(),
  distanceKm: z.number(),
  profileQualityScore: z.number(),
  activityScore: z.number(),
  responseProbabilityScore: z.number(),
  freshnessScore: z.number(),
  feedScore: z.number(),
  scoreBreakdown: z.object({
    distance: z.number(),
    ageFit: z.number(),
    activity: z.number(),
    profileQuality: z.number(),
    responseProbability: z.number(),
    freshness: z.number()
  })
});

export const radarFeedResponseSchema = z.object({
  items: z.array(radarFeedItemSchema),
  cache: z.object({
    hit: z.boolean(),
    remaining: z.number().int().nonnegative()
  })
});

export const swipeResponseSchema = z.object({
  swipeId: z.string(),
  targetUserId: z.string(),
  direction: z.enum(["left", "right", "super"]),
  isMatch: z.boolean()
});

export type RadarQuery = z.infer<typeof radarQuerySchema>;
export type CreateSwipeBody = z.infer<typeof createSwipeBodySchema>;
