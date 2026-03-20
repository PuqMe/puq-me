import type { FastifyPluginAsync } from "fastify";
import {
  accountDeletionBodySchema,
  dataExportRequestBodySchema,
  exportRequestIdParamsSchema
} from "./schema.js";
import { GDPRService } from "./service.js";

const routes: FastifyPluginAsync = async (app) => {
  const service = new GDPRService(app);

  app.post(
    "/export",
    { preHandler: [app.authenticate] },
    async (request) => {
      const payload = dataExportRequestBodySchema.parse(request.body);
      const userId = request.user?.sub ?? "anonymous";

      return service.requestDataExport(userId);
    }
  );

  app.get(
    "/export/:requestId",
    { preHandler: [app.authenticate] },
    async (request) => {
      const params = exportRequestIdParamsSchema.parse(request.params);
      const userId = request.user?.sub ?? "anonymous";

      const status = await service.getExportStatus(userId, params.requestId);

      return {
        export: status
      };
    }
  );

  app.post(
    "/delete",
    { preHandler: [app.authenticate] },
    async (request) => {
      const payload = accountDeletionBodySchema.parse(request.body);
      const userId = request.user?.sub ?? "anonymous";

      return service.requestAccountDeletion(userId, payload.password, payload.reason);
    }
  );

  app.post(
    "/delete/cancel",
    { preHandler: [app.authenticate] },
    async (request) => {
      const userId = request.user?.sub ?? "anonymous";

      return service.cancelAccountDeletion(userId);
    }
  );
};

export default routes;
