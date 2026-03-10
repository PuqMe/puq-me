import type { FastifyPluginAsync } from "fastify";
import { matchIdParamsSchema, resolveMatchBodySchema } from "./schema.js";
import { MatchService } from "./service.js";

const routes: FastifyPluginAsync = async (app) => {
  const service = new MatchService(app);

  app.get("/", { preHandler: [app.authenticate] }, async (request) =>
    service.listMatches(request.user?.sub ?? "anonymous")
  );

  app.get("/:matchId", { preHandler: [app.authenticate] }, async (request) => {
    const params = matchIdParamsSchema.parse(request.params);
    return service.getMatch(request.user?.sub ?? "anonymous", params.matchId);
  });

  app.post("/resolve", { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = resolveMatchBodySchema.parse(request.body);
    const result = await service.ensureMatchFromPositiveSwipe(
      request.user?.sub ?? "anonymous",
      payload.targetUserId
    );

    return reply.code(result.match && result.created ? 201 : 200).send(result);
  });
};

export default routes;
