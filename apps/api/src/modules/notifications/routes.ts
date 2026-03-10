import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { ForbiddenError } from "../../common/errors.js";
import {
  deviceIdParamsSchema,
  dispatchNotificationBodySchema,
  notificationIdParamsSchema,
  registerDeviceBodySchema,
  updateNotificationPreferencesBodySchema
} from "./schema.js";
import { NotificationsService } from "./service.js";

const routes: FastifyPluginAsync = async (app) => {
  const service = new NotificationsService(app);
  const ensureAdminAccess = async (request: FastifyRequest) => {
    if (!request.user?.role || !["admin", "moderator"].includes(request.user.role)) {
      throw new ForbiddenError("admin_access_required");
    }
  };

  app.get("/", { preHandler: [app.authenticate] }, async (request) =>
    service.listNotifications(request.user?.sub ?? "anonymous")
  );

  app.post("/:notificationId/read", { preHandler: [app.authenticate] }, async (request) => {
    const params = notificationIdParamsSchema.parse(request.params);
    return service.markRead(request.user?.sub ?? "anonymous", params.notificationId);
  });

  app.get("/devices", { preHandler: [app.authenticate] }, async (request) =>
    service.listDevices(request.user?.sub ?? "anonymous")
  );

  app.post("/devices", { preHandler: [app.authenticate] }, async (request) => {
    const payload = registerDeviceBodySchema.parse(request.body);
    return service.registerDevice(request.user?.sub ?? "anonymous", payload, request.headers["user-agent"]);
  });

  app.delete("/devices/:deviceId", { preHandler: [app.authenticate] }, async (request) => {
    const params = deviceIdParamsSchema.parse(request.params);
    return service.deactivateDevice(request.user?.sub ?? "anonymous", params.deviceId);
  });

  app.get("/preferences", { preHandler: [app.authenticate] }, async (request) =>
    service.getPreferences(request.user?.sub ?? "anonymous")
  );

  app.put("/preferences", { preHandler: [app.authenticate] }, async (request) => {
    const payload = updateNotificationPreferencesBodySchema.parse(request.body);
    return service.updatePreferences(request.user?.sub ?? "anonymous", payload);
  });

  app.post("/dispatch", { preHandler: [app.authenticate, ensureAdminAccess] }, async (request) => {
    const payload = dispatchNotificationBodySchema.parse(request.body);
    return service.dispatch(payload);
  });
};

export default routes;
