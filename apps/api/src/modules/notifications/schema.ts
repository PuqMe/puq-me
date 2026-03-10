import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "new_match",
  "new_message",
  "message_reminder",
  "profile_approved",
  "safety_warning",
  "product_update"
]);

export const notificationPrioritySchema = z.enum(["active", "silent"]);
export const notificationChannelSchema = z.enum(["push", "web_push", "in_app", "email"]);
export const devicePlatformSchema = z.enum(["web", "ios", "android"]);
export const deviceProviderSchema = z.enum(["web_push", "fcm", "apns"]);

export const registerDeviceBodySchema = z.object({
  platform: devicePlatformSchema,
  provider: deviceProviderSchema,
  token: z.string().min(16),
  endpoint: z.string().url().optional(),
  keys: z
    .object({
      p256dh: z.string().min(1),
      auth: z.string().min(1)
    })
    .optional(),
  locale: z.string().min(2).max(16).optional()
});

export const notificationIdParamsSchema = z.object({
  notificationId: z.string().regex(/^\d+$/)
});

export const deviceIdParamsSchema = z.object({
  deviceId: z.string().regex(/^\d+$/)
});

export const updateNotificationPreferencesBodySchema = z.object({
  newMatch: z.boolean(),
  newMessage: z.boolean(),
  messageReminder: z.boolean(),
  profileApproved: z.boolean(),
  safetyWarning: z.boolean(),
  productUpdates: z.boolean(),
  quietHours: z
    .object({
      enabled: z.boolean(),
      startHour: z.number().int().min(0).max(23).nullable(),
      endHour: z.number().int().min(0).max(23).nullable()
    })
    .superRefine((value, ctx) => {
      if (value.enabled && (value.startHour === null || value.endHour === null)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "quiet_hours_range_required"
        });
      }
    })
});

export const dispatchNotificationBodySchema = z.object({
  userId: z.string().regex(/^\d+$/),
  type: notificationTypeSchema,
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(240),
  priority: notificationPrioritySchema.default("active"),
  channel: notificationChannelSchema.default("push"),
  payload: z.record(z.string(), z.unknown()).default({})
});

export const notificationDeviceSchema = z.object({
  deviceId: z.string(),
  platform: devicePlatformSchema,
  provider: deviceProviderSchema,
  isActive: z.boolean(),
  locale: z.string().nullable(),
  createdAt: z.string()
});

export const notificationPreferencesSchema = z.object({
  newMatch: z.boolean(),
  newMessage: z.boolean(),
  messageReminder: z.boolean(),
  profileApproved: z.boolean(),
  safetyWarning: z.boolean(),
  productUpdates: z.boolean(),
  quietHours: z.object({
    enabled: z.boolean(),
    startHour: z.number().int().min(0).max(23).nullable(),
    endHour: z.number().int().min(0).max(23).nullable()
  })
});

export const notificationItemSchema = z.object({
  notificationId: z.string(),
  type: notificationTypeSchema,
  channel: notificationChannelSchema,
  priority: notificationPrioritySchema,
  status: z.enum(["queued", "sent", "failed", "read"]),
  payload: z.record(z.string(), z.unknown()),
  sentAt: z.string().nullable(),
  readAt: z.string().nullable(),
  createdAt: z.string()
});

export const listNotificationsResponseSchema = z.object({
  items: z.array(notificationItemSchema)
});

export const listDevicesResponseSchema = z.object({
  items: z.array(notificationDeviceSchema)
});

export const dispatchNotificationResponseSchema = z.object({
  notification: notificationItemSchema,
  dispatch: z.object({
    shouldSendPush: z.boolean(),
    activeDeviceCount: z.number().int().nonnegative()
  }),
  event: z.object({
    type: z.literal("notification.dispatch.requested"),
    userId: z.string(),
    notificationId: z.string(),
    channel: notificationChannelSchema
  })
});

export const notificationDeviceMutationResponseSchema = z.object({
  success: z.literal(true)
});

export const markNotificationReadResponseSchema = z.object({
  success: z.literal(true),
  notificationId: z.string()
});

export type RegisterDeviceBody = z.infer<typeof registerDeviceBodySchema>;
export type UpdateNotificationPreferencesBody = z.infer<typeof updateNotificationPreferencesBodySchema>;
export type DispatchNotificationBody = z.infer<typeof dispatchNotificationBodySchema>;
