import { z } from "zod";

export const photoModerationStatusSchema = z.enum(["pending", "approved", "rejected"]);
export const photoVariantNameSchema = z.enum(["original", "thumb", "512w", "1024w"]);
export const uploadPurposeSchema = z.enum(["avatar", "image", "chat_media"]);

export const createUploadIntentBodySchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  sizeBytes: z.number().int().positive(),
  purpose: z.literal("profile_photo").default("profile_photo")
});

export const genericUploadIntentBodySchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  sizeBytes: z.number().int().positive()
});

export const completeUploadBodySchema = z.object({
  photoId: z.string().regex(/^\d+$/),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  fileSizeBytes: z.number().int().positive().optional()
});

export const photoIdParamsSchema = z.object({
  photoId: z.string().regex(/^\d+$/)
});

export const reorderPhotosBodySchema = z.object({
  orderedPhotoIds: z.array(z.string().regex(/^\d+$/)).min(1).max(6)
});

export const setPrimaryPhotoBodySchema = z.object({
  photoId: z.string().regex(/^\d+$/)
});

export const photoVariantSchema = z.object({
  variantName: photoVariantNameSchema,
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  url: z.string().nullable()
});

export const profilePhotoSchema = z.object({
  photoId: z.string(),
  sortOrder: z.number().int().nonnegative(),
  isPrimary: z.boolean(),
  moderationStatus: photoModerationStatusSchema,
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  mimeType: z.string().nullable(),
  fileSizeBytes: z.number().int().nullable(),
  uploadedAt: z.string(),
  publicUrl: z.string().nullable(),
  variants: z.array(photoVariantSchema)
});

export const uploadIntentResponseSchema = z.object({
  photoId: z.string(),
  objectKey: z.string(),
  uploadUrl: z.string(),
  maxUploadSizeBytes: z.number().int().positive(),
  acceptedMimeTypes: z.array(z.string()),
  storage: z.object({
    bucket: z.string(),
    publicBaseUrl: z.string()
  }),
  moderationStatus: photoModerationStatusSchema
});

export const profilePhotoListResponseSchema = z.object({
  items: z.array(profilePhotoSchema)
});

export const completeUploadResponseSchema = z.object({
  photo: profilePhotoSchema,
  processing: z.object({
    compressionQueued: z.boolean(),
    variantsPlanned: z.array(photoVariantNameSchema)
  })
});

export const genericUploadIntentResponseSchema = z.object({
  uploadId: z.string(),
  purpose: uploadPurposeSchema,
  bucket: z.string(),
  objectKey: z.string(),
  uploadUrl: z.string(),
  publicUrl: z.string(),
  expiresInSeconds: z.number().int().positive(),
  maxUploadSizeBytes: z.number().int().positive(),
  acceptedMimeTypes: z.array(z.string()),
  requiredHeaders: z.record(z.string(), z.string()),
  security: z.object({
    signedUrl: z.boolean(),
    malwareScanHookConfigured: z.boolean(),
    moderationRequired: z.boolean(),
    publicDeliveryRequiresApproval: z.boolean()
  })
});

export type CreateUploadIntentBody = z.infer<typeof createUploadIntentBodySchema>;
export type CompleteUploadBody = z.infer<typeof completeUploadBodySchema>;
export type GenericUploadIntentBody = z.infer<typeof genericUploadIntentBodySchema>;
