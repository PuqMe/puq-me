import type { FastifyPluginAsync } from "fastify";
import { userIdParamsSchema } from "./schema.js";
import { UsersService } from "./service.js";

const routes: FastifyPluginAsync = async (app) => {
  const service = new UsersService(app);

  app.get("/", { preHandler: [app.authenticate] }, async () => service.listUsers());

  app.get("/:userId", { preHandler: [app.authenticate] }, async (request) => {
    const params = userIdParamsSchema.parse(request.params);
    return service.getUser(params.userId);
  });
};

export default routes;
