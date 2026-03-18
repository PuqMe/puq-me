import type { FastifyPluginAsync } from "fastify";
import { listEncountersQuerySchema, locationEventBodySchema } from "./schema.js";
import { CircleService } from "./service.js";

const routes: FastifyPluginAsync = async (app) => {
  const service = new CircleService();

  app.get("/encounters", async (request) => {
    const query = listEncountersQuerySchema.parse(request.query);
    return service.listEncounters(query);
  });

  app.post("/location-events", async (request, reply) => {
    const payload = locationEventBodySchema.parse(request.body);
    return reply.code(201).send(service.storeLocationEvent(payload));
  });
};

export default routes;
