import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";

const securityPlugin: FastifyPluginAsync = async (app) => {
  await app.register(sensible);
  await app.register(cors, {
    origin: [app.config.APP_ORIGIN],
    credentials: true
  });
  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: false
  });
  await app.register(rateLimit, {
    global: true,
    max: 250,
    timeWindow: "1 minute",
    redis: app.redis
  });
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1
    }
  });
};

export default fp(securityPlugin);
