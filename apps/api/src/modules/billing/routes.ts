import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { ForbiddenError } from "../../common/errors.js";
import {
  consumeCreditBodySchema,
  createCheckoutSessionBodySchema,
  featureCodeParamsSchema,
  providerEventBodySchema
} from "./schema.js";
import { BillingService } from "./service.js";
import { WebhookHandler } from "./webhook-handler.js";

const routes: FastifyPluginAsync = async (app) => {
  const service = new BillingService(app);
  const stripeSecretKey = app.config.STRIPE_SECRET_KEY || "";
  const stripeWebhookSecret = app.config.STRIPE_WEBHOOK_SECRET || "";
  const webhookHandler = new WebhookHandler(app, stripeSecretKey, stripeWebhookSecret);

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

  app.post(
    "/webhooks/stripe",
    { config: { rawBody: true } },
    async (request) => {
      const signature = request.headers["stripe-signature"] as string;
      if (!signature) {
        throw new ForbiddenError("missing_webhook_signature");
      }
      await webhookHandler.handleStripeWebhook(signature, request.rawBody);
      return { received: true };
    }
  );

  app.post(
    "/webhooks/apple",
    { config: { rawBody: true } },
    async (request) => {
      const payload = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
      await webhookHandler.handleAppStoreWebhook(payload as Record<string, unknown>);
      return { received: true };
    }
  );

  app.post(
    "/webhooks/google",
    { config: { rawBody: true } },
    async (request) => {
      const payload = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
      await webhookHandler.handleGooglePlayWebhook(payload as Record<string, unknown>);
      return { received: true };
    }
  );
};

export default routes;
