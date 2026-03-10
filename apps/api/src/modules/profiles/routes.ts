import type { FastifyPluginAsync } from "fastify";
import {
  updateInterestsBodySchema,
  updateLocationBodySchema,
  updatePreferencesBodySchema,
  updateProfileBodySchema,
  updateVisibilityBodySchema
} from "./schema.js";
import { ProfilesService } from "./service.js";

const routes: FastifyPluginAsync = async (app) => {
  const service = new ProfilesService(app);

  app.get("/me", { preHandler: [app.authenticate] }, async (request) =>
    service.getCurrentProfile(request.user?.sub ?? "anonymous")
  );

  app.patch("/me", { preHandler: [app.authenticate] }, async (request) => {
    const payload = updateProfileBodySchema.parse(request.body);
    return service.updateProfile(request.user?.sub ?? "anonymous", payload);
  });

  app.patch("/me/visibility", { preHandler: [app.authenticate] }, async (request) => {
    const payload = updateVisibilityBodySchema.parse(request.body);
    return service.updateVisibility(request.user?.sub ?? "anonymous", payload);
  });

  app.put("/me/interests", { preHandler: [app.authenticate] }, async (request) => {
    const payload = updateInterestsBodySchema.parse(request.body);
    return service.replaceInterests(request.user?.sub ?? "anonymous", payload);
  });

  app.put("/me/preferences", { preHandler: [app.authenticate] }, async (request) => {
    const payload = updatePreferencesBodySchema.parse(request.body);
    return service.updatePreferences(request.user?.sub ?? "anonymous", payload);
  });

  app.put("/me/location", { preHandler: [app.authenticate] }, async (request) => {
    const payload = updateLocationBodySchema.parse(request.body);
    return service.updateLocation(request.user?.sub ?? "anonymous", payload);
  });
};

export default routes;
