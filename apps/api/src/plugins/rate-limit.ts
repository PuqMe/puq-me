import fp from "fastify-plugin";
import type { FastifyPluginAsync, FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";

interface RouteRateLimitConfig {
  max: number;
  timeWindow: string;
}

const rateLimitPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  // Register the rate limit plugin with default global settings
  await app.register(rateLimit, {
    global: true,
    max: app.config.RATE_LIMIT_MAX || 100,
    timeWindow: app.config.RATE_LIMIT_WINDOW || "1 minute",
    redis: app.redis || undefined,
    skipOnError: false,
    allowList: ["/health", "/status"]
  });

  // Configure rate limit settings for different route groups
  const rateLimitConfigs: Record<string, RouteRateLimitConfig> = {
    // Auth routes: stricter limits to prevent brute force attacks
    auth: {
      max: 10,
      timeWindow: "1 minute"
    },

    // Swipe routes: allow frequent swiping
    swipe: {
      max: 120,
      timeWindow: "1 minute"
    },

    // Chat routes: moderate limit for messaging
    chat: {
      max: 60,
      timeWindow: "1 minute"
    },

    // Media upload routes: allow fewer uploads
    media: {
      max: 20,
      timeWindow: "1 minute"
    },

    // Webhook routes: high limit for provider callbacks
    webhook: {
      max: 200,
      timeWindow: "1 minute"
    }
  };

  // Hook into route registration to apply specific limits
  app.addHook("onRoute", (routeOptions) => {
    const routePath = routeOptions.path || "";

    // Apply auth limits
    if (routePath.includes("/auth/") || routePath.includes("/login") || routePath.includes("/register")) {
      if (!routeOptions.config) {
        routeOptions.config = {};
      }
      routeOptions.config.rateLimit = {
        max: rateLimitConfigs.auth.max,
        timeWindow: rateLimitConfigs.auth.timeWindow
      };
    }

    // Apply swipe limits
    if (routePath.includes("/swipe") || routePath.includes("/like")) {
      if (!routeOptions.config) {
        routeOptions.config = {};
      }
      routeOptions.config.rateLimit = {
        max: rateLimitConfigs.swipe.max,
        timeWindow: rateLimitConfigs.swipe.timeWindow
      };
    }

    // Apply chat limits
    if (routePath.includes("/chat") || routePath.includes("/messages")) {
      if (!routeOptions.config) {
        routeOptions.config = {};
      }
      routeOptions.config.rateLimit = {
        max: rateLimitConfigs.chat.max,
        timeWindow: rateLimitConfigs.chat.timeWindow
      };
    }

    // Apply media upload limits
    if (routePath.includes("/upload") || routePath.includes("/photos") || routePath.includes("/media")) {
      if (!routeOptions.config) {
        routeOptions.config = {};
      }
      routeOptions.config.rateLimit = {
        max: rateLimitConfigs.media.max,
        timeWindow: rateLimitConfigs.media.timeWindow
      };
    }

    // Apply webhook limits (highest limit)
    if (routePath.includes("/webhook") || routePath.includes("/callback")) {
      if (!routeOptions.config) {
        routeOptions.config = {};
      }
      routeOptions.config.rateLimit = {
        max: rateLimitConfigs.webhook.max,
        timeWindow: rateLimitConfigs.webhook.timeWindow
      };
    }
  });

  // Custom error handler for rate limit exceeded
  app.addHook("onError", (request, reply, error) => {
    if (error.statusCode === 429) {
      const retryAfter = request.rateLimit?.ttl || 60;
      reply.header("Retry-After", Math.ceil(retryAfter / 1000));
      reply.header("X-RateLimit-Limit", request.rateLimit?.max || 100);
      reply.header("X-RateLimit-Remaining", request.rateLimit?.remaining || 0);
      reply.header("X-RateLimit-Reset", new Date(Date.now() + retryAfter).toISOString());

      return reply.code(429).send({
        statusCode: 429,
        code: "too_many_requests",
        message: "Too many requests, please try again later"
      });
    }
  });

  // Decorate request with rate limit headers helper
  app.decorateRequest("rateLimit", {
    max: 0,
    remaining: 0,
    ttl: 0
  });

  // Add hook to include rate limit info in responses
  app.addHook("onSend", (request, reply, payload, done) => {
    if (request.rateLimit) {
      reply.header("X-RateLimit-Limit", request.rateLimit.max || 100);
      reply.header("X-RateLimit-Remaining", request.rateLimit.remaining ?? 0);
      reply.header("X-RateLimit-Reset", new Date(Date.now() + (request.rateLimit.ttl || 0)).toISOString());
    }
    done(null, payload);
  });

  app.log.info("Rate limit plugin configured with tiered limits");
};

export default fp(rateLimitPlugin);
