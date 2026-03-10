import type { FastifyInstance } from "fastify";
import { TooManyRequestsError, ValidationError } from "../../common/errors.js";
import { NotificationsRepository } from "./repository.js";
import type {
  DispatchNotificationBody,
  RegisterDeviceBody,
  UpdateNotificationPreferencesBody
} from "./schema.js";

const preferenceMap: Record<DispatchNotificationBody["type"], keyof UpdateNotificationPreferencesBody> = {
  new_match: "newMatch",
  new_message: "newMessage",
  message_reminder: "messageReminder",
  profile_approved: "profileApproved",
  safety_warning: "safetyWarning",
  product_update: "productUpdates"
};

export class NotificationsService {
  private readonly repository: NotificationsRepository;

  constructor(private readonly app: FastifyInstance) {
    this.repository = new NotificationsRepository(app);
  }

  private dispatchRateKey(userId: string, type: DispatchNotificationBody["type"]) {
    return `notifications:dispatch:${userId}:${type}`;
  }

  async listNotifications(userId: string) {
    return {
      items: await this.repository.listForUser(userId)
    };
  }

  async markRead(userId: string, notificationId: string) {
    await this.repository.markRead(userId, notificationId);

    return {
      success: true as const,
      notificationId
    };
  }

  async registerDevice(userId: string, body: RegisterDeviceBody, userAgent?: string) {
    if (body.provider === "web_push" && (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth)) {
      throw new ValidationError("web_push_subscription_keys_required");
    }

    return this.repository.registerDevice(userId, body, userAgent);
  }

  listDevices(userId: string) {
    return this.repository.listDevices(userId);
  }

  async deactivateDevice(userId: string, deviceId: string) {
    await this.repository.deactivateDevice(userId, deviceId);

    return {
      success: true as const
    };
  }

  getPreferences(userId: string) {
    return this.repository.getPreferences(userId);
  }

  updatePreferences(userId: string, body: UpdateNotificationPreferencesBody) {
    return this.repository.upsertPreferences(userId, body);
  }

  async dispatch(input: DispatchNotificationBody) {
    const rateKey = this.dispatchRateKey(input.userId, input.type);
    const currentCount = await this.app.redis.incr(rateKey);
    if (currentCount === 1) {
      await this.app.redis.expire(rateKey, 60 * 30);
    }
    if (currentCount > 20) {
      throw new TooManyRequestsError("notification_dispatch_rate_limit_exceeded");
    }

    const preferences = await this.repository.getPreferences(input.userId);
    const preferenceKey = preferenceMap[input.type];
    if (!preferences[preferenceKey]) {
      const notification = await this.repository.createNotification({
        ...input,
        channel: "in_app",
        priority: "silent",
        payload: {
          ...input.payload,
          title: input.title,
          body: input.body,
          skippedByPreference: true
        }
      });

      return {
        notification,
        dispatch: {
          shouldSendPush: false,
          activeDeviceCount: 0
        },
        event: {
          type: "notification.dispatch.requested" as const,
          userId: input.userId,
          notificationId: notification.notificationId,
          channel: notification.channel
        }
      };
    }

    const notification = await this.repository.createNotification({
      ...input,
      payload: {
        ...input.payload,
        title: input.title,
        body: input.body
      }
    });

    const activeDeviceCount = await this.repository.countActiveDevices(input.userId);
    await this.repository.enqueueDispatchEvent({
      notificationId: notification.notificationId,
      userId: input.userId,
      type: input.type,
      channel: input.channel,
      priority: input.priority,
      payload: notification.payload
    });
    await this.repository.markSent(notification.notificationId);

    this.app.log.info(
      {
        event: "notification.dispatch.requested",
        notificationId: notification.notificationId,
        userId: input.userId,
        type: input.type,
        channel: input.channel,
        activeDeviceCount
      },
      "notification dispatch prepared"
    );

    return {
      notification: {
        ...notification,
        status: "sent" as const
      },
      dispatch: {
        shouldSendPush: input.channel === "push" || input.channel === "web_push",
        activeDeviceCount
      },
      event: {
        type: "notification.dispatch.requested" as const,
        userId: input.userId,
        notificationId: notification.notificationId,
        channel: input.channel
      }
    };
  }
}
