import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import Redis from "ioredis";

const redisPlugin: FastifyPluginAsync = async (app) => {
  const redis = new Redis(app.config.REDIS_URL, {
    lazyConnect: false,
    maxRetriesPerRequest: 2
  });

  await redis.ping();

  app.decorate("redis", redis);

  app.addHook("onClose", async () => {
    await redis.quit();
  });
};

export default fp(redisPlugin);
