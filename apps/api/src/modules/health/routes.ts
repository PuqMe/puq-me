import type { FastifyPluginAsync } from "fastify";

const routes: FastifyPluginAsync = async (app) => {
  app.get("/live", async () => ({ status: "ok" }));
  app.get("/ready", async () => ({ status: "ready" }));
};

export default routes;
