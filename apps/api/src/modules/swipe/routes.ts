import type { FastifyPluginAsync } from "fastify";
import { createSwipeBodySchema, radarQuerySchema } from "./schema.js";
import { SwipeService } from "./service.js";

const routes: FastifyPluginAsync = async (app) => {
  const service = new SwipeService(app);

  app.get("/radar", { preHandler: [app.authenticate] }, async (request) => {
    const query = radarQuerySchema.parse(request.query);
    return service.getRadarFeed(request.user?.sub ?? "anonymous", query);
  });

  app.get("/discover", { preHandler: [app.authenticate] }, async (request) => {
    const query = radarQuerySchema.parse(request.query);
    return service.getRadarFeed(request.user?.sub ?? "anonymous", query);
  });

  app.post("/", { preHandler: [app.authenticate] }, async (request) => {
    const payload = createSwipeBodySchema.parse(request.body);
    return service.createSwipe(request.user?.sub ?? "anonymous", payload.targetUserId, payload.direction);
  });
};

export default routes;
