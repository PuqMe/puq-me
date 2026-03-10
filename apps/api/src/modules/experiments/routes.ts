import type { FastifyPluginAsync } from "fastify";
import { exposureBodySchema } from "./schema.js";
import { ExperimentsService } from "./service.js";

const routes: FastifyPluginAsync = async (app) => {
  const service = new ExperimentsService(app);

  app.get("/flags/me", { preHandler: [app.authenticate] }, async (request) =>
    service.listFlagsForUser(request.user?.sub ?? "anonymous")
  );

  app.get("/assignments/me", { preHandler: [app.authenticate] }, async (request) =>
    service.listExperimentsForUser(request.user?.sub ?? "anonymous")
  );

  app.post("/exposures", { preHandler: [app.authenticate] }, async (request) => {
    const payload = exposureBodySchema.parse(request.body);
    return service.markExposure(request.user?.sub ?? "anonymous", payload.experimentKey, payload.variant);
  });
};

export default routes;
