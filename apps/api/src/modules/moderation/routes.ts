import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { ForbiddenError } from "../../common/errors.js";
import {
  createReportBodySchema,
  evaluateRiskBodySchema,
  reportListQuerySchema,
  riskUserIdParamsSchema
} from "./schema.js";
import { ModerationService } from "./service.js";

const routes: FastifyPluginAsync = async (app) => {
  const service = new ModerationService(app);
  const ensureAdminAccess = async (request: FastifyRequest) => {
    if (!request.user?.role || !["admin", "moderator"].includes(request.user.role)) {
      throw new ForbiddenError("admin_access_required");
    }
  };

  app.post("/reports", { preHandler: [app.authenticate] }, async (request) => {
    const payload = createReportBodySchema.parse(request.body);
    return service.createReport(request.user?.sub ?? "anonymous", payload);
  });

  app.get("/reports/mine", { preHandler: [app.authenticate] }, async (request) => {
    const query = reportListQuerySchema.parse(request.query);
    return service.listOwnReports(request.user?.sub ?? "anonymous", query);
  });

  app.post("/risk/evaluate", { preHandler: [app.authenticate] }, async (request) => {
    const payload = evaluateRiskBodySchema.parse(request.body);
    const isAdmin = ["admin", "moderator"].includes(request.user?.role ?? "");
    return service.evaluateRisk(request.user?.sub ?? "anonymous", payload, isAdmin);
  });

  app.get("/risk/:userId", { preHandler: [app.authenticate, ensureAdminAccess] }, async (request) => {
    const params = riskUserIdParamsSchema.parse(request.params);
    return service.getRiskProfile(request.user?.sub ?? "anonymous", params.userId);
  });
};

export default routes;
