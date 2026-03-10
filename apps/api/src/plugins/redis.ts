import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import Redis from "ioredis";

const redisPlugin: FastifyPluginAsync = async (app) => {
  const client = new Redis(app.config.REDIS_URL, {
    maxRetriesPerRequest: 2
  });

  app.decorate("redis", client);

  app.addHook("onClose", async () => {
    await client.quit();
  });
};

export default fp(redisPlugin);
