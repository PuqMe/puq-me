import { z } from "zod";

export const analyticsEventNameSchema = z.enum([
  "auth.registered",
  "onboarding.abandoned",
  "profile.completed",
  "media.photo_uploaded",
  "swipe.created",
  "match.created",
  "chat.message_sent",
  "retention.app_opened",
  "billing.premium_converted",
  "experiment.exposed",
  "feature_flag.evaluated"
]);

export const analyticsPlatformSchema = z.enum(["web", "ios", "android", "server"]);

export const analyticsEventBodySchema = z.object({
  eventName: analyticsEventNameSchema,
  anonymousId: z.string().trim().min(8).max(128).optional(),
  sessionId: z.string().trim().min(8).max(128).optional(),
  platform: analyticsPlatformSchema.default("web"),
  occurredAt: z.string().datetime().optional(),
  countryCode: z.string().trim().length(2).optional(),
  properties: z.record(z.string(), z.unknown()).default({}),
  experiment: z
    .object({
      key: z.string().trim().min(1).max(80),
      variant: z.string().trim().min(1).max(80)
    })
    .optional()
});

export const analyticsOverviewQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(30)
});

export const analyticsEventItemSchema = z.object({
  eventId: z.string(),
  eventName: analyticsEventNameSchema,
  platform: analyticsPlatformSchema,
  occurredAt: z.string(),
  anonymousId: z.string().nullable(),
  sessionId: z.string().nullable(),
  countryCode: z.string().nullable(),
  properties: z.record(z.string(), z.unknown())
});

export const analyticsTrackResponseSchema = z.object({
  event: analyticsEventItemSchema
});

export const analyticsOverviewSchema = z.object({
  periodDays: z.number().int().positive(),
  summary: z.object({
    registrations: z.number().int().nonnegative(),
    onboardingAbandons: z.number().int().nonnegative(),
    profileCompletions: z.number().int().nonnegative(),
    photoUploads: z.number().int().nonnegative(),
    swipes: z.number().int().nonnegative(),
    matches: z.number().int().nonnegative(),
    messages: z.number().int().nonnegative(),
    retentionOpens: z.number().int().nonnegative(),
    premiumConversions: z.number().int().nonnegative()
  })
});

export type AnalyticsEventBody = z.infer<typeof analyticsEventBodySchema>;
