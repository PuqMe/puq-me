import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import { ForbiddenError } from "../../common/errors.js";
import {
  adminCreateReportNoteBodySchema,
  adminReportIdParamsSchema,
  adminReportListQuerySchema,
  adminUpdateReportBodySchema,
  updateUserStatusBodySchema
} from "./schema.js";
import { AdminService } from "./service.js";

const paramsSchema = z.object({
  userId: z.string().regex(/^\d+$/)
});

const routes: FastifyPluginAsync = async (app) => {
  const service = new AdminService(app);
  const ensureAdminAccess = async (request: FastifyRequest) => {
    if (!request.user?.role || !["admin", "moderator"].includes(request.user.role)) {
      throw new ForbiddenError("admin_access_required");
    }
  };

  app.get("/stats", { preHandler: [app.authenticate, ensureAdminAccess] }, async () => service.getDashboardStats());

  app.get("/reports", { preHandler: [app.authenticate, ensureAdminAccess] }, async (request) => {
    const query = adminReportListQuerySchema.parse(request.query);
    return {
      items: await service.listReports(query)
    };
  });

  app.get("/reports/:reportId", { preHandler: [app.authenticate, ensureAdminAccess] }, async (request) => {
    const params = adminReportIdParamsSchema.parse(request.params);
    return {
      report: await service.getReport(params.reportId)
    };
  });

  app.patch("/reports/:reportId", { preHandler: [app.authenticate, ensureAdminAccess] }, async (request) => {
    const params = adminReportIdParamsSchema.parse(request.params);
    const body = adminUpdateReportBodySchema.parse(request.body);
    return {
      report: await service.updateReport(params.reportId, request.user?.sub ?? "anonymous", body)
    };
  });

  app.post("/reports/:reportId/notes", { preHandler: [app.authenticate, ensureAdminAccess] }, async (request) => {
    const params = adminReportIdParamsSchema.parse(request.params);
    const body = adminCreateReportNoteBodySchema.parse(request.body);
    return {
      note: await service.addReportNote(params.reportId, request.user?.sub ?? "anonymous", body.note)
    };
  });

  app.post("/users/:userId/status", { preHandler: [app.authenticate, ensureAdminAccess] }, async (request) => {
    const params = paramsSchema.parse(request.params);
    const body = updateUserStatusBodySchema.parse(request.body);
    return service.updateUserStatus(params.userId, body.status);
  });
};

export default routes;
