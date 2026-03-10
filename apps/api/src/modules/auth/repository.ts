import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";

export type AuthUserRecord = {
  id: string;
  email: string;
  status: string;
  passwordHash?: string;
  emailVerifiedAt?: string | null;
};

export class AuthRepository {
  constructor(private readonly app: FastifyInstance) {}

  async createUser(email: string, passwordHash: string): Promise<AuthUserRecord> {
    const result = await this.app.db.query<{
      id: string;
      email: string;
      status: string;
    }>(
      `insert into users (public_id, email, password_hash, status)
       values ($1, $2, $3, 'pending')
       returning id::text, email::text, status`,
      [randomUUID(), email, passwordHash]
    );

    return result.rows[0];
  }

  async findUserByEmail(email: string): Promise<AuthUserRecord | null> {
    const result = await this.app.db.query<{
      id: string;
      email: string;
      status: string;
      password_hash: string;
      email_verified_at: string | null;
    }>(
      `select id::text, email::text, status, password_hash, email_verified_at::text
       from users
       where email = $1 and deleted_at is null
       limit 1`,
      [email]
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      status: row.status,
      passwordHash: row.password_hash,
      emailVerifiedAt: row.email_verified_at
    };
  }

  async findUserById(userId: string): Promise<AuthUserRecord | null> {
    const result = await this.app.db.query<{
      id: string;
      email: string;
      status: string;
      email_verified_at: string | null;
    }>(
      `select id::text, email::text, status, email_verified_at::text
       from users
       where id = $1 and deleted_at is null
       limit 1`,
      [userId]
    );

    const row = result.rows[0];
    return row
      ? {
          id: row.id,
          email: row.email,
          status: row.status,
          emailVerifiedAt: row.email_verified_at
        }
      : null;
  }

  async createSession(input: {
    sessionId: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string | null;
  }) {
    await this.app.db.query(
      `insert into user_sessions (session_id, user_id, refresh_token_hash, user_agent, ip_address, expires_at)
       values ($1, $2, $3, $4, $5, $6)`,
      [input.sessionId, input.userId, input.refreshTokenHash, input.userAgent ?? null, input.ipAddress, input.expiresAt]
    );
  }

  async findActiveSessionByTokenHash(refreshTokenHash: string) {
    const result = await this.app.db.query<{
      session_id: string;
      user_id: string;
      expires_at: string;
    }>(
      `select session_id::text, user_id::text, expires_at::text
       from user_sessions
       where refresh_token_hash = $1
         and revoked_at is null
         and expires_at > now()
       limit 1`,
      [refreshTokenHash]
    );

    return result.rows[0] ?? null;
  }

  async rotateSession(sessionId: string, refreshTokenHash: string, expiresAt: Date) {
    await this.app.db.query(
      `update user_sessions
       set refresh_token_hash = $2,
           expires_at = $3,
           last_seen_at = now(),
           updated_at = now()
       where session_id = $1`,
      [sessionId, refreshTokenHash, expiresAt]
    );
  }

  async revokeSessionByTokenHash(refreshTokenHash: string) {
    await this.app.db.query(
      `update user_sessions
       set revoked_at = now(),
           updated_at = now()
       where refresh_token_hash = $1
         and revoked_at is null`,
      [refreshTokenHash]
    );
  }

  async createVerificationRequest(userId: string, payload: Record<string, unknown>) {
    await this.app.db.query(
      `insert into verification_requests (user_id, verification_type, status, request_payload)
       values ($1, 'email', 'pending', $2::jsonb)`,
      [userId, JSON.stringify(payload)]
    );
  }

  async createPasswordResetRequest(userId: string, payload: Record<string, unknown>) {
    await this.app.db.query(
      `insert into verification_requests (user_id, verification_type, status, request_payload)
       values ($1, 'manual', 'pending', $2::jsonb)`,
      [userId, JSON.stringify(payload)]
    );
  }
}
