import { z } from "zod";

export const flagTypeSchema = z.enum(["release", "ops", "permission"]);
export const audienceTypeSchema = z.enum(["all", "authenticated", "premium", "country"]);
export const experimentStatusSchema = z.enum(["draft", "active", "paused", "completed"]);

export const exposureBodySchema = z.object({
  experimentKey: z.string().trim().min(2).max(80),
  variant: z.string().trim().min(1).max(80),
  surface: z.string().trim().min(1).max(80).optional()
});

export const featureEvaluationQuerySchema = z.object({
  surface: z.string().trim().min(1).max(80).optional()
});

export const featureFlagItemSchema = z.object({
  key: z.string(),
  type: flagTypeSchema,
  enabled: z.boolean(),
  reason: z.enum(["default", "targeted", "override", "disabled"]),
  payload: z.record(z.string(), z.unknown())
});

export const experimentAssignmentItemSchema = z.object({
  key: z.string(),
  variant: z.string(),
  status: experimentStatusSchema,
  payload: z.record(z.string(), z.unknown()),
  exposed: z.boolean()
});

export const featureFlagsResponseSchema = z.object({
  items: z.array(featureFlagItemSchema)
});

export const experimentAssignmentsResponseSchema = z.object({
  items: z.array(experimentAssignmentItemSchema)
});

export const exposureResponseSchema = z.object({
  success: z.literal(true),
  experimentKey: z.string(),
  variant: z.string()
});

export type ExposureBody = z.infer<typeof exposureBodySchema>;
