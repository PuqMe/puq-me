import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import rateLimit from "@fastify/rate-limit";

const rateLimitPlugin: FastifyPluginAsync = async (app) => {
  await app.register(rateLimit, {
    global: true,
    max: app.config.RATE_LIMIT_MAX,
    timeWindow: app.config.RATE_LIMIT_WINDOW,
    redis: app.redis
  });
};

export default fp(rateLimitPlugin);
