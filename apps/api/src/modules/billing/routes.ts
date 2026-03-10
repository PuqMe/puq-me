import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { ForbiddenError } from "../../common/errors.js";
import {
  consumeCreditBodySchema,
  createCheckoutSessionBodySchema,
  featureCodeParamsSchema,
  providerEventBodySchema
} from "./schema.js";
import { BillingService } from "./service.js";

const routes: FastifyPluginAsync = async (app) => {
  const service = new BillingService(app);

  const ensureAdminAccess = async (request: FastifyRequest) => {
    if (!request.user?.role || !["admin", "moderator"].includes(request.user.role)) {
      throw new ForbiddenError("admin_access_required");
    }
  };

  app.get("/products", async () => service.listProducts());

  app.get("/me", { preHandler: [app.authenticate] }, async (request) =>
    service.getBillingOverview(request.user?.sub ?? "anonymous")
  );

  app.get("/features", { preHandler: [app.authenticate] }, async (request) =>
    service.listFeatureAccess(request.user?.sub ?? "anonymous")
  );

  app.get("/features/:featureCode", { preHandler: [app.authenticate] }, async (request) => {
    const params = featureCodeParamsSchema.parse(request.params);
    return service.assertFeatureAccess(request.user?.sub ?? "anonymous", params.featureCode);
  });

  app.post("/checkout-sessions", { preHandler: [app.authenticate] }, async (request) => {
    const payload = createCheckoutSessionBodySchema.parse(request.body);
    return service.createCheckoutSession(request.user?.sub ?? "anonymous", payload);
  });

  app.post("/credits/consume", { preHandler: [app.authenticate] }, async (request) => {
    const payload = consumeCreditBodySchema.parse(request.body);
    return service.consumeCredit(request.user?.sub ?? "anonymous", payload);
  });

  app.post("/provider-events", { preHandler: [app.authenticate, ensureAdminAccess] }, async (request) => {
    const payload = providerEventBodySchema.parse(request.body);
    return service.storeProviderEvent(payload);
  });
};

export default routes;
