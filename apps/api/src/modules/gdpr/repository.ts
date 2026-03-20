import type { FastifyInstance } from "fastify";
import { NotFoundError } from "../../common/errors.js";

type DataExportRequestRow = {
  id: string;
  user_id: string;
  status: "pending" | "processing" | "ready" | "expired" | "failed";
  created_at: string;
  expires_at: string | null;
  download_url: string | null;
  error_message: string | null;
};

type DeletionRequestRow = {
  id: string;
  user_id: string;
  status: "pending" | "scheduled" | "completed" | "canceled";
  deletion_scheduled_for: string;
  created_at: string;
  reason: string | null;
};

type UserDataRow = {
  user_id: string;
  email: string;
  username: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
};

export class GDPRRepository {
  constructor(private readonly app: FastifyInstance) {}

  async createDataExportRequest(userId: string): Promise<string> {
    const result = await this.app.db.query<{ request_id: string }>(
      `insert into gdpr_data_export_requests (
         user_id,
         status,
         created_at,
         updated_at,
         expires_at
       )
       values ($1::bigint, 'pending', now(), now(), now() + interval '7 days')
       returning id::text as request_id`,
      [userId]
    );

    return result.rows[0].request_id;
  }

  async getDataExportRequest(userId: string, requestId: string): Promise<DataExportRequestRow | null> {
    const result = await this.app.db.query<DataExportRequestRow>(
      `select
         id::text,
         user_id::text,
         status,
         created_at::text,
         expires_at::text,
         download_url,
         error_message
       from gdpr_data_export_requests
       where id = $1::bigint
         and user_id = $2::bigint
       limit 1`,
      [requestId, userId]
    );

    return result.rows[0] || null;
  }

  async updateExportRequestStatus(
    requestId: string,
    status: "pending" | "processing" | "ready" | "expired" | "failed",
    downloadUrl?: string,
    errorMessage?: string
  ): Promise<void> {
    await this.app.db.query(
      `update gdpr_data_export_requests
       set status = $1,
           download_url = coalesce($2, download_url),
           error_message = coalesce($3, error_message),
           updated_at = now()
       where id = $4::bigint`,
      [status, downloadUrl || null, errorMessage || null, requestId]
    );
  }

  async createDeletionRequest(userId: string, reason?: string): Promise<string> {
    const result = await this.app.db.query<{ request_id: string }>(
      `insert into gdpr_deletion_requests (
         user_id,
         status,
         reason,
         deletion_scheduled_for,
         created_at,
         updated_at
       )
       values ($1::bigint, 'pending', $2, now() + interval '30 days', now(), now())
       returning id::text as request_id`,
      [userId, reason || null]
    );

    return result.rows[0].request_id;
  }

  async getDeletionRequest(userId: string): Promise<DeletionRequestRow | null> {
    const result = await this.app.db.query<DeletionRequestRow>(
      `select
         id::text,
         user_id::text,
         status,
         deletion_scheduled_for::text,
         created_at::text,
         reason
       from gdpr_deletion_requests
       where user_id = $1::bigint
       order by created_at desc
       limit 1`,
      [userId]
    );

    return result.rows[0] || null;
  }

  async cancelDeletionRequest(userId: string): Promise<void> {
    const result = await this.app.db.query(
      `update gdpr_deletion_requests
       set status = 'canceled',
           updated_at = now()
       where user_id = $1::bigint
         and status = 'scheduled'
       returning id`,
      [userId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError("no_active_deletion_request");
    }
  }

  async getUserData(userId: string): Promise<{
    user: UserDataRow | null;
    profiles: Array<Record<string, unknown>>;
    matches: Array<Record<string, unknown>>;
    messages: Array<Record<string, unknown>>;
    media: Array<Record<string, unknown>>;
  }> {
    const [userResult, profilesResult, matchesResult, messagesResult, mediaResult] = await Promise.all([
      this.app.db.query<UserDataRow>(
        `select
           id::text as user_id,
           email,
           username,
           phone,
           created_at::text,
           updated_at::text
         from users
         where id = $1::bigint
         limit 1`,
        [userId]
      ),
      this.app.db.query<Record<string, unknown>>(
        `select
           id::text,
           user_id::text,
           display_name,
           bio,
           age,
           gender,
           location,
           created_at::text,
           updated_at::text
         from user_profiles
         where user_id = $1::bigint`,
        [userId]
      ),
      this.app.db.query<Record<string, unknown>>(
        `select
           id::text,
           user_id_a::text,
           user_id_b::text,
           status,
           matched_at::text,
           created_at::text
         from matches
         where user_id_a = $1::bigint
            or user_id_b = $1::bigint`,
        [userId]
      ),
      this.app.db.query<Record<string, unknown>>(
        `select
           id::text,
           sender_id::text,
           recipient_id::text,
           content,
           created_at::text
         from chat_messages
         where sender_id = $1::bigint
            or recipient_id = $1::bigint`,
        [userId]
      ),
      this.app.db.query<Record<string, unknown>>(
        `select
           id::text,
           user_id::text,
           url,
           mime_type,
           uploaded_at::text
         from user_media
         where user_id = $1::bigint`,
        [userId]
      )
    ]);

    return {
      user: userResult.rows[0] || null,
      profiles: profilesResult.rows,
      matches: matchesResult.rows,
      messages: messagesResult.rows,
      media: mediaResult.rows
    };
  }

  async anonymizeUser(userId: string): Promise<void> {
    const anonymousEmail = `deleted_${userId}_${Date.now()}@deleted.local`;
    const anonymousUsername = `deleted_user_${userId}`;

    await Promise.all([
      // Anonymize user account
      this.app.db.query(
        `update users
         set email = $1,
             username = $2,
             phone = null,
             updated_at = now(),
             deleted_at = now()
         where id = $3::bigint`,
        [anonymousEmail, anonymousUsername, userId]
      ),

      // Clear user profile
      this.app.db.query(
        `update user_profiles
         set display_name = 'Deleted User',
             bio = null,
             age = null,
             gender = null,
             location = null,
             updated_at = now()
         where user_id = $1::bigint`,
        [userId]
      ),

      // Clear chat messages
      this.app.db.query(
        `update chat_messages
         set content = '[Message deleted by user]',
             updated_at = now()
         where sender_id = $1::bigint`,
        [userId]
      ),

      // Remove media
      this.app.db.query(
        `delete from user_media
         where user_id = $1::bigint`,
        [userId]
      ),

      // Mark deletion as completed
      this.app.db.query(
        `update gdpr_deletion_requests
         set status = 'completed',
             updated_at = now()
         where user_id = $1::bigint`,
        [userId]
      )
    ]);
  }

  async logGDPRAction(
    userId: string,
    action: string,
    details: Record<string, unknown>
  ): Promise<void> {
    await this.app.db.query(
      `insert into gdpr_audit_log (
         user_id,
         action,
         details,
         created_at
       )
       values ($1::bigint, $2, $3::jsonb, now())`,
      [userId, action, JSON.stringify(details)]
    );
  }

  async markExportAsExpired(requestId: string): Promise<void> {
    await this.app.db.query(
      `update gdpr_data_export_requests
       set status = 'expired',
           download_url = null,
           updated_at = now()
       where id = $1::bigint`,
      [requestId]
    );
  }
}
