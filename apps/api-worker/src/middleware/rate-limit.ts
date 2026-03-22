import { createMiddleware } from "hono/factory";
import type { AppContext } from "../env.js";
import { TooManyRequestsError } from "../lib/errors.js";

/**
 * Rate limiting via Cloudflare KV.
 * Sliding window counter with configurable max requests and window size.
 */
export function rateLimit(options: { max: number; windowSeconds: number; keyPrefix?: string }) {
  return createMiddleware<AppContext>(async (c, next) => {
    const ip = c.req.header("CF-Connecting-IP") ?? c.req.header("X-Forwarded-For") ?? "unknown";
    const userId = c.get("userId");
    const identifier = userId ?? ip;
    const prefix = options.keyPrefix ?? c.req.path.replace(/\//g, "_");
    const key = `rl:${prefix}:${identifier}`;

    const current = parseInt((await c.env.KV.get(key)) ?? "0", 10);

    if (current >= options.max) {
      throw new TooManyRequestsError("rate_limit_exceeded");
    }

    // Non-blocking KV write
    c.executionCtx.waitUntil(
      c.env.KV.put(key, String(current + 1), { expirationTtl: options.windowSeconds })
    );

    await next();
  });
}
