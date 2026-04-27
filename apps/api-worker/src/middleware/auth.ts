import { createMiddleware } from "hono/factory";
import type { AppContext } from "../env.js";
import { verifyJwt } from "../lib/jwt.js";
import { UnauthorizedError } from "../lib/errors.js";
import { readAccessCookie } from "../lib/cookies.js";

/**
 * JWT authentication middleware for protected routes.
 *
 * Token sources (in this order):
 *   1. `Authorization: Bearer <token>` header — for native/mobile clients.
 *   2. `puqme_at` HTTP-only cookie — for the web client (Round 4: HTTP-only auth).
 *
 * If neither is present (or the token is invalid/expired), responds with 401.
 * On success, sets `userId` and `userEmail` on the Hono context.
 */
export const auth = createMiddleware<AppContext>(async (c, next) => {
  let token: string | undefined;

  const authorization = c.req.header("Authorization");
  if (authorization?.startsWith("Bearer ")) {
    token = authorization.slice(7);
  } else {
    const cookieToken = readAccessCookie(c);
    if (cookieToken) token = cookieToken;
  }

  if (!token) {
    throw new UnauthorizedError("missing_authorization_header");
  }

  try {
    const payload = await verifyJwt<{
      sub: string;
      email: string;
      role: string;
    }>(token, c.env.JWT_SECRET);

    if (!payload.sub) {
      throw new UnauthorizedError("invalid_token_payload");
    }

    c.set("userId", payload.sub);
    c.set("userEmail", payload.email ?? "");
  } catch {
    throw new UnauthorizedError("invalid_or_expired_token");
  }

  await next();
});
