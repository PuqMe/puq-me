import { z } from "zod";

export const billingProviderSchema = z.enum(["stripe", "app_store", "google_play", "manual"]);
export const billingProductTypeSchema = z.enum(["subscription", "consumable"]);
export const billingIntervalUnitSchema = z.enum(["week", "month", "year"]);
export const subscriptionStatusSchema = z.enum([
  "trialing",
  "active",
  "past_due",
  "canceled",
  "expired",
  "incomplete"
]);
export const featureCodeSchema = z.enum([
  "unlimited_likes",
  "boost",
  "super_likes",
  "advanced_filters",
  "passport_mode",
  "profile_visitors"
]);

export const createCheckoutSessionBodySchema = z.object({
  provider: billingProviderSchema,
  priceId: z.string().regex(/^\d+$/),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
});

export const featureCodeParamsSchema = z.object({
  featureCode: featureCodeSchema
});

export const consumeCreditBodySchema = z.object({
  featureCode: z.enum(["boost", "super_likes"]),
  amount: z.number().int().positive().max(25).default(1)
});

export const providerEventBodySchema = z.object({
  provider: billingProviderSchema,
  eventType: z.string().trim().min(3).max(120),
  externalEventId: z.string().trim().min(3).max(180),
  payload: z.record(z.string(), z.unknown()).default({})
});

export const billingPriceSchema = z.object({
  priceId: z.string(),
  provider: billingProviderSchema,
  currency: z.string(),
  amountCents: z.number().int().nonnegative(),
  intervalUnit: billingIntervalUnitSchema.nullable(),
  intervalCount: z.number().int().positive().nullable()
});

export const billingProductSchema = z.object({
  productId: z.string(),
  code: z.string(),
  name: z.string(),
  productType: billingProductTypeSchema,
  prices: z.array(billingPriceSchema)
});

export const featureAccessItemSchema = z.object({
  featureCode: featureCodeSchema,
  enabled: z.boolean(),
  source: z.enum(["free", "subscription", "override", "wallet"]),
  expiresAt: z.string().nullable()
});

export const billingWalletSchema = z.object({
  boostCredits: z.number().int().nonnegative(),
  superLikeCredits: z.number().int().nonnegative()
});

export const subscriptionSummarySchema = z.object({
  subscriptionId: z.string().nullable(),
  status: subscriptionStatusSchema.nullable(),
  productCode: z.string().nullable(),
  provider: billingProviderSchema.nullable(),
  currentPeriodEnd: z.string().nullable(),
  cancelAtPeriodEnd: z.boolean()
});

export const billingOverviewSchema = z.object({
  subscription: subscriptionSummarySchema,
  features: z.array(featureAccessItemSchema),
  wallet: billingWalletSchema
});

export const createCheckoutSessionResponseSchema = z.object({
  checkoutSessionId: z.string(),
  provider: billingProviderSchema,
  status: z.enum(["pending", "ready"]),
  clientSecret: z.string().nullable(),
  redirectUrl: z.string().url().nullable()
});

export const consumeCreditResponseSchema = z.object({
  success: z.literal(true),
  featureCode: z.enum(["boost", "super_likes"]),
  remainingCredits: z.number().int().nonnegative()
});

export const providerEventResponseSchema = z.object({
  success: z.literal(true),
  providerEventId: z.string()
});

export type CreateCheckoutSessionBody = z.infer<typeof createCheckoutSessionBodySchema>;
export type ConsumeCreditBody = z.infer<typeof consumeCreditBodySchema>;
export type ProviderEventBody = z.infer<typeof providerEventBodySchema>;
export type FeatureCode = z.infer<typeof featureCodeSchema>;
