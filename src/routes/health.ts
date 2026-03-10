import type { FastifyPluginAsync } from "fastify";

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/live", async () => ({ status: "ok" }));

  app.get("/ready", async () => {
    await app.db.query("select 1");
    await app.redis.ping();
    return { status: "ready" };
  });
};

export default healthRoutes;
