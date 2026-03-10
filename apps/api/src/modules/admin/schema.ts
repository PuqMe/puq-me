import { z } from "zod";

export const updateUserStatusBodySchema = z.object({
  status: z.enum(["active", "suspended", "banned"])
});

export const adminReportListQuerySchema = z.object({
  status: z.enum(["open", "in_review", "resolved", "rejected"]).optional(),
  targetType: z.enum(["user", "profile", "message"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25)
});

export const adminReportIdParamsSchema = z.object({
  reportId: z.string().regex(/^\d+$/)
});

export const adminUpdateReportBodySchema = z.object({
  status: z.enum(["open", "in_review", "resolved", "rejected"]),
  resolution: z.string().trim().max(2000).optional()
});

export const adminCreateReportNoteBodySchema = z.object({
  note: z.string().trim().min(3).max(4000)
});
