import { createMiddleware } from "hono/factory";
import type { AppContext } from "../env.js";
import { verifyJwt } from "../lib/jwt.js";
import { UnauthorizedError } from "../lib/errors.js";

/**
 * JWT authentication middleware for protected routes.
 * Extracts and verifies the Bearer token, then sets userId and userEmail.
 */
export const auth = createMiddleware<AppContext>(async (c, next) => {
  const authorization = c.req.header("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new UnauthorizedError("missing_authorization_header");
  }

  const token = authorization.slice(7);

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
