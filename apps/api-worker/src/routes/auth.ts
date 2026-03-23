import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { AppContext } from "../env.js";
import { signJwt, verifyJwt } from "../lib/jwt.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { BadRequestError, ConflictError, UnauthorizedError } from "../lib/errors.js";
import { rateLimit } from "../middleware/rate-limit.js";
import { verifyGoogleIdToken } from "../lib/google-auth.js";

const registerBody = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128)
});

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const googleLoginBody = z.object({
  credential: z.string().min(1)
});

const refreshBody = z.object({
  refreshToken: z.string().min(1)
});

const logoutBody = z.object({
  refreshToken: z.string().min(1)
});

const forgotPasswordBody = z.object({
  email: z.string().email()
});

const resetPasswordBody = z.object({
  token: z.string().min(32),
  password: z.string().min(8).max(128)
});

const auth = new Hono<AppContext>();

// Helper: SHA-256 hash for opaque tokens
async function hashOpaqueToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function parseExpiryToMs(input: string): number {
  const amount = parseInt(input, 10);
  if (input.endsWith("d")) return amount * 24 * 60 * 60 * 1000;
  if (input.endsWith("h")) return amount * 60 * 60 * 1000;
  if (input.endsWith("m")) return amount * 60 * 1000;
  return 30 * 24 * 60 * 60 * 1000;
}

function buildDisplayName(email: string): string {
  const local = email.split("@")[0] ?? "PuQ User";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  const titled = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  return (titled || "PuQ User").slice(0, 80);
}

async function issueTokens(
  env: AppContext["Bindings"],
  user: { id: string; email: string },
  meta: { userAgent?: string; ipAddress?: string },
  existingSessionId?: string
) {
  const JWT_EXPIRES_IN = "15m";
  const JWT_REFRESH_EXPIRES_IN = "30d";

  const sessionId = existingSessionId ?? crypto.randomUUID();

  const accessToken = await signJwt(
    { sub: user.id, email: user.email, role: "user" },
    env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = await signJwt(
    { sub: user.id, email: user.email, session: sessionId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  const refreshTokenHash = await hashOpaqueToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseExpiryToMs(JWT_REFRESH_EXPIRES_IN)).toISOString();

  if (existingSessionId) {
    await env.DB.prepare(
      `UPDATE user_sessions SET refresh_token_hash = ?, expires_at = ?, last_seen_at = datetime('now'), updated_at = datetime('now') WHERE session_id = ?`
    ).bind(refreshTokenHash, expiresAt, existingSessionId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO user_sessions (session_id, user_id, refresh_token_hash, user_agent, ip_address, expires_at) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(sessionId, user.id, refreshTokenHash, meta.userAgent ?? null, meta.ipAddress ?? null, expiresAt).run();
  }

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN,
    refreshExpiresIn: JWT_REFRESH_EXPIRES_IN
  };
}

// POST /v1/auth/register
auth.post("/register", async (c) => {
  const body = registerBody.parse(await c.req.json());

  const existing = await c.env.DB.prepare(
    `SELECT id FROM users WHERE email = ? COLLATE NOCASE AND deleted_at IS NULL LIMIT 1`
  ).bind(body.email).first();

  if (existing) {
    throw new ConflictError("email_already_registered");
  }

  const passwordHash = await hashPassword(body.password);
  const publicId = crypto.randomUUID();

  const result = await c.env.DB.prepare(
    `INSERT INTO users (public_id, email, password_hash, status) VALUES (?, ?, ?, 'pending') RETURNING id, email, status`
  ).bind(publicId, body.email, passwordHash).first<{ id: number; email: string; status: string }>();

  if (!result) throw new Error("Failed to create user");

  // Create bootstrap profile
  await c.env.DB.prepare(
    `INSERT INTO profiles (user_id, display_name, birth_date) VALUES (?, ?, '2000-01-01') ON CONFLICT (user_id) DO NOTHING`
  ).bind(result.id, buildDisplayName(body.email)).run();

  // Create verification request
  const verificationToken = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO verification_requests (user_id, verification_type, status, request_payload) VALUES (?, 'email', 'pending', ?)`
  ).bind(result.id, JSON.stringify({ email: body.email, token: verificationToken, purpose: "email_verification" })).run();

  const tokens = await issueTokens(
    c.env,
    { id: String(result.id), email: result.email },
    { userAgent: c.req.header("User-Agent"), ipAddress: c.req.header("CF-Connecting-IP") }
  );

  return c.json({
    user: { id: String(result.id), email: result.email, status: result.status },
    tokens
  }, 201);
});

// POST /v1/auth/login
auth.post("/login", rateLimit({ max: 10, windowSeconds: 900, keyPrefix: "auth_login" }), async (c) => {
  const body = loginBody.parse(await c.req.json());

  const user = await c.env.DB.prepare(
    `SELECT id, email, status, password_hash FROM users WHERE email = ? COLLATE NOCASE AND deleted_at IS NULL LIMIT 1`
  ).bind(body.email).first<{ id: number; email: string; status: string; password_hash: string | null }>();

  if (!user?.password_hash) {
    throw new UnauthorizedError("invalid_credentials");
  }

  const valid = await verifyPassword(body.password, user.password_hash);
  if (!valid) {
    throw new UnauthorizedError("invalid_credentials");
  }

  const tokens = await issueTokens(
    c.env,
    { id: String(user.id), email: user.email },
    { userAgent: c.req.header("User-Agent"), ipAddress: c.req.header("CF-Connecting-IP") }
  );

  return c.json({
    user: { id: String(user.id), email: user.email, status: user.status },
    tokens
  });
});

// POST /v1/auth/google
auth.post("/google", async (c) => {
  const body = googleLoginBody.parse(await c.req.json());

  // Verify Google ID token using JWKS public keys (RS256)
  // Accept both the backend secret client ID and the frontend web client ID
  const acceptedClientIds = [c.env.GOOGLE_CLIENT_ID, c.env.GOOGLE_CLIENT_ID_WEB].filter(Boolean);
  let payload;
  try {
    payload = await verifyGoogleIdToken(body.credential, acceptedClientIds, c.env.KV);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown_error";
    throw new UnauthorizedError(`google_verification_failed: ${message}`);
  }

  // Check if user exists by google_sub
  let user = await c.env.DB.prepare(
    `SELECT id, email, status FROM users WHERE google_sub = ? AND deleted_at IS NULL LIMIT 1`
  ).bind(payload.sub).first<{ id: number; email: string; status: string }>();

  if (!user) {
    // Check by email
    const existing = await c.env.DB.prepare(
      `SELECT id, email, status FROM users WHERE email = ? COLLATE NOCASE AND deleted_at IS NULL LIMIT 1`
    ).bind(payload.email).first<{ id: number; email: string; status: string }>();

    if (existing) {
      // Link Google account
      await c.env.DB.prepare(
        `UPDATE users SET google_sub = ?, status = 'active', email_verified_at = COALESCE(email_verified_at, datetime('now')), updated_at = datetime('now') WHERE id = ?`
      ).bind(payload.sub, existing.id).run();
      user = existing;
    } else {
      // Create new user
      const publicId = crypto.randomUUID();
      const result = await c.env.DB.prepare(
        `INSERT INTO users (public_id, email, google_sub, status) VALUES (?, ?, ?, 'active') RETURNING id, email, status`
      ).bind(publicId, payload.email, payload.sub).first<{ id: number; email: string; status: string }>();

      if (!result) throw new Error("Failed to create Google user");

      await c.env.DB.prepare(
        `INSERT INTO profiles (user_id, display_name, birth_date) VALUES (?, ?, '2000-01-01') ON CONFLICT (user_id) DO NOTHING`
      ).bind(result.id, buildDisplayName(payload.email)).run();

      user = result;
    }
  }

  const tokens = await issueTokens(
    c.env,
    { id: String(user.id), email: user.email },
    { userAgent: c.req.header("User-Agent"), ipAddress: c.req.header("CF-Connecting-IP") }
  );

  return c.json({
    user: { id: String(user.id), email: user.email, status: user.status },
    tokens
  });
});

// POST /v1/auth/refresh
auth.post("/refresh", async (c) => {
  const body = refreshBody.parse(await c.req.json());

  let payload: { sub: string; session: string };
  try {
    payload = await verifyJwt<{ sub: string; session: string }>(body.refreshToken, c.env.JWT_REFRESH_SECRET);
  } catch {
    throw new UnauthorizedError("invalid_refresh_token");
  }

  const refreshTokenHash = await hashOpaqueToken(body.refreshToken);

  const session = await c.env.DB.prepare(
    `SELECT session_id, user_id FROM user_sessions WHERE refresh_token_hash = ? AND revoked_at IS NULL AND expires_at > datetime('now') LIMIT 1`
  ).bind(refreshTokenHash).first<{ session_id: string; user_id: number }>();

  if (!session) {
    throw new UnauthorizedError("invalid_refresh_token");
  }

  const user = await c.env.DB.prepare(
    `SELECT id, email, status FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1`
  ).bind(session.user_id).first<{ id: number; email: string; status: string }>();

  if (!user) {
    throw new UnauthorizedError("invalid_refresh_token");
  }

  const tokens = await issueTokens(
    c.env,
    { id: String(user.id), email: user.email },
    { userAgent: c.req.header("User-Agent"), ipAddress: c.req.header("CF-Connecting-IP") },
    session.session_id
  );

  return c.json({
    user: { id: String(user.id), email: user.email, status: user.status },
    tokens
  });
});

// POST /v1/auth/logout
auth.post("/logout", async (c) => {
  const body = logoutBody.parse(await c.req.json());
  const refreshTokenHash = await hashOpaqueToken(body.refreshToken);

  await c.env.DB.prepare(
    `UPDATE user_sessions SET revoked_at = datetime('now'), updated_at = datetime('now') WHERE refresh_token_hash = ? AND revoked_at IS NULL`
  ).bind(refreshTokenHash).run();

  return c.json({ message: "logged_out" });
});

// POST /v1/auth/forgot-password
auth.post("/forgot-password", async (c) => {
  const body = forgotPasswordBody.parse(await c.req.json());

  const user = await c.env.DB.prepare(
    `SELECT id FROM users WHERE email = ? COLLATE NOCASE AND deleted_at IS NULL LIMIT 1`
  ).bind(body.email).first<{ id: number }>();

  if (user) {
    const token = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO verification_requests (user_id, verification_type, status, request_payload) VALUES (?, 'manual', 'pending', ?)`
    ).bind(user.id, JSON.stringify({ email: body.email, token, purpose: "password_reset" })).run();
  }

  return c.json({ message: "password_reset_prepared" });
});

// POST /v1/auth/reset-password
auth.post("/reset-password", async (c) => {
  const body = resetPasswordBody.parse(await c.req.json());

  const resetRequest = await c.env.DB.prepare(
    `SELECT user_id FROM verification_requests WHERE json_extract(request_payload, '$.token') = ? AND verification_type = 'manual' AND status = 'pending' AND created_at > datetime('now', '-1 hour') LIMIT 1`
  ).bind(body.token).first<{ user_id: number }>();

  if (!resetRequest) {
    throw new UnauthorizedError("invalid_or_expired_reset_token");
  }

  const passwordHash = await hashPassword(body.password);

  await c.env.DB.batch([
    c.env.DB.prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ? AND deleted_at IS NULL`).bind(passwordHash, resetRequest.user_id),
    c.env.DB.prepare(`UPDATE user_sessions SET revoked_at = datetime('now'), updated_at = datetime('now') WHERE user_id = ? AND revoked_at IS NULL`).bind(resetRequest.user_id),
    c.env.DB.prepare(`UPDATE verification_requests SET status = 'consumed', updated_at = datetime('now') WHERE json_extract(request_payload, '$.token') = ? AND verification_type = 'manual'`).bind(body.token)
  ]);

  return c.json({ message: "password_reset_successful" });
});

export default auth;
