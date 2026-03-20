import { z } from "zod";

export const dataExportRequestBodySchema = z.object({
  email: z.string().email().optional()
});

export const accountDeletionBodySchema = z.object({
  password: z.string().min(1),
  reason: z.string().max(500).optional()
});

export const exportRequestIdParamsSchema = z.object({
  requestId: z.string().regex(/^\d+$/)
});

export const dataExportStatusResponseSchema = z.object({
  requestId: z.string(),
  userId: z.string(),
  status: z.enum(["pending", "processing", "ready", "expired", "failed"]),
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
  downloadUrl: z.string().url().nullable(),
  errorMessage: z.string().nullable()
});

export const dataExportRequestResponseSchema = z.object({
  requestId: z.string(),
  status: z.enum(["pending", "processing", "ready", "expired", "failed"]),
  createdAt: z.string(),
  message: z.string()
});

export const accountDeletionRequestResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  deletionScheduledFor: z.string()
});

export const accountDeletionCancelResponseSchema = z.object({
  success: z.literal(true),
  message: z.string()
});

export type DataExportRequestBody = z.infer<typeof dataExportRequestBodySchema>;
export type AccountDeletionBody = z.infer<typeof accountDeletionBodySchema>;
export type ExportRequestIdParams = z.infer<typeof exportRequestIdParamsSchema>;
