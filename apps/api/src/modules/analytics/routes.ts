import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { ForbiddenError } from "../../common/errors.js";
import { analyticsEventBodySchema, analyticsOverviewQuerySchema } from "./schema.js";
import { AnalyticsService } from "./service.js";

const routes: FastifyPluginAsync = async (app) => {
  const service = new AnalyticsService(app);

  const ensureAdminAccess = async (request: FastifyRequest) => {
    if (!request.user?.role || !["admin", "moderator"].includes(request.user.role)) {
      throw new ForbiddenError("admin_access_required");
    }
  };

  app.post("/events", async (request) => {
    const payload = analyticsEventBodySchema.parse(request.body);

    return service.trackEvent(
      request.user?.sub ?? null,
      payload,
      {
        ipAddress:
          typeof request.headers["cf-connecting-ip"] === "string"
            ? request.headers["cf-connecting-ip"]
            : request.ip
      }
    );
  });

  app.get("/overview", { preHandler: [app.authenticate, ensureAdminAccess] }, async (request) => {
    const query = analyticsOverviewQuerySchema.parse(request.query);
    return service.getOverview(query.days);
  });
};

export default routes;
