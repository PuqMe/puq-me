import { z } from "zod";

export const reportReasonSchema = z.enum([
  "spam",
  "fake_profile",
  "scam",
  "harassment",
  "sexual_content",
  "underage_concern",
  "other"
]);

export const reportTargetTypeSchema = z.enum(["user", "profile", "message"]);
export const moderationStatusSchema = z.enum(["open", "in_review", "resolved", "rejected"]);
export const riskLevelSchema = z.enum(["low", "medium", "high", "critical"]);
export const riskReviewStatusSchema = z.enum(["clear", "watch", "needs_review", "restricted"]);
export const riskAutoActionSchema = z.enum(["none", "watch", "throttle", "verification_required", "manual_review"]);

export const createReportBodySchema = z
  .object({
    targetType: reportTargetTypeSchema,
    targetUserId: z.string().regex(/^\d+$/).optional(),
    targetMessageId: z.string().regex(/^\d+$/).optional(),
    reason: reportReasonSchema,
    details: z.string().trim().max(2000).optional()
  })
  .superRefine((value, ctx) => {
    if ((value.targetType === "user" || value.targetType === "profile") && !value.targetUserId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "target_user_id_required",
        path: ["targetUserId"]
      });
    }

    if (value.targetType === "message" && !value.targetMessageId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "target_message_id_required",
        path: ["targetMessageId"]
      });
    }
  });

export const reportListQuerySchema = z.object({
  status: moderationStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const reportAdminNoteSchema = z.object({
  note: z.string().trim().min(3).max(4000)
});

export const reportAdminUpdateSchema = z.object({
  status: moderationStatusSchema,
  resolution: z.string().trim().max(2000).optional()
});

export const reportIdParamsSchema = z.object({
  reportId: z.string().regex(/^\d+$/)
});

export const riskUserIdParamsSchema = z.object({
  userId: z.string().regex(/^\d+$/)
});

export const evaluateRiskBodySchema = z.object({
  userId: z.string().regex(/^\d+$/),
  registrationDurationSeconds: z.number().int().nonnegative().max(86400).optional(),
  swipeRatePerMinute: z.number().nonnegative().max(1000).optional(),
  rightSwipeRatio: z.number().min(0).max(1).optional(),
  identicalMessagesLastHour: z.number().int().nonnegative().max(10000).optional(),
  suspiciousProfileTextScore: z.number().min(0).max(100).optional(),
  photoPatternScore: z.number().min(0).max(100).optional(),
  reportsLast24h: z.number().int().nonnegative().max(10000).optional(),
  triggeredBy: z
    .enum(["registration", "swipe", "chat", "profile_update", "photo_upload", "report_spike", "manual"])
    .default("manual")
});

export const reportAdminNoteItemSchema = z.object({
  noteId: z.string(),
  reportId: z.string(),
  adminUserId: z.string(),
  note: z.string(),
  createdAt: z.string()
});

export const reportItemSchema = z.object({
  reportId: z.string(),
  targetType: reportTargetTypeSchema,
  targetUserId: z.string().nullable(),
  targetMessageId: z.string().nullable(),
  reason: reportReasonSchema,
  details: z.string().nullable(),
  status: moderationStatusSchema,
  resolution: z.string().nullable(),
  reporterUserId: z.string(),
  assignedAdminUserId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  notes: z.array(reportAdminNoteItemSchema)
});

export const createReportResponseSchema = z.object({
  report: reportItemSchema
});

export const listReportsResponseSchema = z.object({
  items: z.array(reportItemSchema)
});

export const riskSignalItemSchema = z.object({
  signalId: z.string(),
  signalType: z.enum([
    "registration_speed",
    "swipe_behavior",
    "message_duplication",
    "profile_text",
    "photo_pattern",
    "report_spike"
  ]),
  signalKey: z.string(),
  scoreDelta: z.number(),
  severity: z.enum(["low", "medium", "high"]),
  evidence: z.record(z.string(), z.unknown()),
  occurredAt: z.string()
});

export const userRiskProfileSchema = z.object({
  userId: z.string(),
  riskScore: z.number(),
  riskLevel: riskLevelSchema,
  reviewStatus: riskReviewStatusSchema,
  autoAction: riskAutoActionSchema,
  reasons: z.array(z.string()),
  lastEvaluatedAt: z.string().nullable(),
  updatedAt: z.string(),
  signals: z.array(riskSignalItemSchema)
});

export const evaluateRiskResponseSchema = z.object({
  risk: userRiskProfileSchema,
  moderationEscalation: z
    .object({
      escalationId: z.string(),
      status: z.enum(["open", "acknowledged", "resolved"]),
      recommendedAction: riskAutoActionSchema
    })
    .nullable()
});

export type CreateReportBody = z.infer<typeof createReportBodySchema>;
export type ModerationStatus = z.infer<typeof moderationStatusSchema>;
export type EvaluateRiskBody = z.infer<typeof evaluateRiskBodySchema>;
