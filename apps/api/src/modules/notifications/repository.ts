import type { FastifyInstance } from "fastify";
import { NotFoundError } from "../../common/errors.js";
import type {
  DispatchNotificationBody,
  RegisterDeviceBody,
  UpdateNotificationPreferencesBody
} from "./schema.js";

type NotificationRow = {
  notification_id: string;
  type: "new_match" | "new_message" | "message_reminder" | "profile_approved" | "safety_warning" | "product_update";
  channel: "push" | "web_push" | "in_app" | "email";
  priority: "active" | "silent";
  status: "queued" | "sent" | "failed" | "read";
  payload: Record<string, unknown>;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
};

type DeviceRow = {
  device_id: string;
  platform: "web" | "ios" | "android";
  provider: "web_push" | "fcm" | "apns";
  is_active: boolean;
  locale: string | null;
  created_at: string;
};

type PreferencesRow = {
  new_match: boolean;
  new_message: boolean;
  message_reminder: boolean;
  profile_approved: boolean;
  safety_warning: boolean;
  product_updates: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: number | null;
  quiet_hours_end: number | null;
};

export class NotificationsRepository {
  constructor(private readonly app: FastifyInstance) {}

  private mapNotification(row: NotificationRow) {
    return {
      notificationId: row.notification_id,
      type: row.type,
      channel: row.channel,
      priority: row.priority,
      status: row.status,
      payload: row.payload,
      sentAt: row.sent_at,
      readAt: row.read_at,
      createdAt: row.created_at
    };
  }

  private mapPreferences(row: PreferencesRow | undefined) {
    return {
      newMatch: row?.new_match ?? true,
      newMessage: row?.new_message ?? true,
      messageReminder: row?.message_reminder ?? true,
      profileApproved: row?.profile_approved ?? true,
      safetyWarning: row?.safety_warning ?? true,
      productUpdates: row?.product_updates ?? false,
      quietHours: {
        enabled: row?.quiet_hours_enabled ?? false,
        startHour: row?.quiet_hours_start ?? null,
        endHour: row?.quiet_hours_end ?? null
      }
    };
  }

  async listForUser(userId: string) {
    const result = await this.app.db.query<NotificationRow>(
      `select
         id::text as notification_id,
         type,
         channel,
         priority,
         status,
         payload,
         sent_at::text,
         read_at::text,
         created_at::text
       from notifications
       where user_id = $1::bigint
       order by created_at desc
       limit 50`,
      [userId]
    );

    return result.rows.map((row) => this.mapNotification(row));
  }

  async markRead(userId: string, notificationId: string) {
    const result = await this.app.db.query<{ notification_id: string }>(
      `update notifications
       set status = 'read',
           read_at = now(),
           updated_at = now()
       where id = $1::bigint
         and user_id = $2::bigint
       returning id::text as notification_id`,
      [notificationId, userId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError("notification_not_found");
    }
  }

  async registerDevice(userId: string, body: RegisterDeviceBody, userAgent?: string) {
    const result = await this.app.db.query<DeviceRow>(
      `insert into notification_devices (
         user_id,
         platform,
         provider,
         token,
         endpoint,
         p256dh,
         auth_secret,
         user_agent,
         locale,
         is_active,
         last_seen_at,
         created_at,
         updated_at
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, now(), now(), now())
       on conflict (provider, token)
       do update set
         user_id = excluded.user_id,
         platform = excluded.platform,
         endpoint = excluded.endpoint,
         p256dh = excluded.p256dh,
         auth_secret = excluded.auth_secret,
         user_agent = excluded.user_agent,
         locale = excluded.locale,
         is_active = true,
         last_seen_at = now(),
         updated_at = now()
       returning
         id::text as device_id,
         platform,
         provider,
         is_active,
         locale,
         created_at::text`,
      [
        userId,
        body.platform,
        body.provider,
        body.token,
        body.endpoint ?? null,
        body.keys?.p256dh ?? null,
        body.keys?.auth ?? null,
        userAgent ?? null,
        body.locale ?? null
      ]
    );

    return {
      items: result.rows.map((row) => ({
        deviceId: row.device_id,
        platform: row.platform,
        provider: row.provider,
        isActive: row.is_active,
        locale: row.locale,
        createdAt: row.created_at
      }))
    };
  }

  async listDevices(userId: string) {
    const result = await this.app.db.query<DeviceRow>(
      `select
         id::text as device_id,
         platform,
         provider,
         is_active,
         locale,
         created_at::text
       from notification_devices
       where user_id = $1::bigint
       order by created_at desc`,
      [userId]
    );

    return {
      items: result.rows.map((row) => ({
        deviceId: row.device_id,
        platform: row.platform,
        provider: row.provider,
        isActive: row.is_active,
        locale: row.locale,
        createdAt: row.created_at
      }))
    };
  }

  async deactivateDevice(userId: string, deviceId: string) {
    const result = await this.app.db.query<{ device_id: string }>(
      `update notification_devices
       set is_active = false,
           updated_at = now()
       where id = $1::bigint
         and user_id = $2::bigint
       returning id::text as device_id`,
      [deviceId, userId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError("notification_device_not_found");
    }
  }

  async getPreferences(userId: string) {
    const result = await this.app.db.query<PreferencesRow>(
      `select
         new_match,
         new_message,
         message_reminder,
         profile_approved,
         safety_warning,
         product_updates,
         quiet_hours_enabled,
         quiet_hours_start,
         quiet_hours_end
       from notification_preferences
       where user_id = $1::bigint
       limit 1`,
      [userId]
    );

    return this.mapPreferences(result.rows[0]);
  }

  async upsertPreferences(userId: string, body: UpdateNotificationPreferencesBody) {
    const result = await this.app.db.query<PreferencesRow>(
      `insert into notification_preferences (
         user_id,
         new_match,
         new_message,
         message_reminder,
         profile_approved,
         safety_warning,
         product_updates,
         quiet_hours_enabled,
         quiet_hours_start,
         quiet_hours_end,
         created_at,
         updated_at
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now())
       on conflict (user_id)
       do update set
         new_match = excluded.new_match,
         new_message = excluded.new_message,
         message_reminder = excluded.message_reminder,
         profile_approved = excluded.profile_approved,
         safety_warning = excluded.safety_warning,
         product_updates = excluded.product_updates,
         quiet_hours_enabled = excluded.quiet_hours_enabled,
         quiet_hours_start = excluded.quiet_hours_start,
         quiet_hours_end = excluded.quiet_hours_end,
         updated_at = now()
       returning
         new_match,
         new_message,
         message_reminder,
         profile_approved,
         safety_warning,
         product_updates,
         quiet_hours_enabled,
         quiet_hours_start,
         quiet_hours_end`,
      [
        userId,
        body.newMatch,
        body.newMessage,
        body.messageReminder,
        body.profileApproved,
        body.safetyWarning,
        body.productUpdates,
        body.quietHours.enabled,
        body.quietHours.startHour,
        body.quietHours.endHour
      ]
    );

    return this.mapPreferences(result.rows[0]);
  }

  async countActiveDevices(userId: string) {
    const result = await this.app.db.query<{ count: string }>(
      `select count(*)::text as count
       from notification_devices
       where user_id = $1::bigint
         and is_active = true`,
      [userId]
    );

    return Number(result.rows[0]?.count ?? 0);
  }

  async createNotification(input: DispatchNotificationBody) {
    const result = await this.app.db.query<NotificationRow>(
      `insert into notifications (
         user_id,
         type,
         channel,
         payload,
         status,
         priority,
         created_at,
         updated_at
       )
       values ($1, $2, $3, $4::jsonb, 'queued', $5, now(), now())
       returning
         id::text as notification_id,
         type,
         channel,
         priority,
         status,
         payload,
         sent_at::text,
         read_at::text,
         created_at::text`,
      [input.userId, input.type, input.channel, JSON.stringify(input.payload), input.priority]
    );

    return this.mapNotification(result.rows[0]);
  }

  async enqueueDispatchEvent(input: {
    notificationId: string;
    userId: string;
    type: DispatchNotificationBody["type"];
    channel: DispatchNotificationBody["channel"];
    priority: DispatchNotificationBody["priority"];
    payload: Record<string, unknown>;
  }) {
    await this.app.db.query(
      `insert into notification_outbox (
         notification_id,
         user_id,
         event_type,
         channel,
         priority,
         payload,
         status,
         created_at,
         updated_at
       )
       values ($1::bigint, $2::bigint, $3, $4, $5, $6::jsonb, 'pending', now(), now())`,
      [
        input.notificationId,
        input.userId,
        "notification.dispatch.requested",
        input.channel,
        input.priority,
        JSON.stringify({
          notificationId: input.notificationId,
          userId: input.userId,
          type: input.type,
          channel: input.channel,
          priority: input.priority,
          ...input.payload
        })
      ]
    );
  }

  async markSent(notificationId: string) {
    await this.app.db.query(
      `update notifications
       set status = 'sent',
           sent_at = now(),
           updated_at = now()
       where id = $1::bigint`,
      [notificationId]
    );
  }
}
