import type { FastifyInstance } from "fastify";
import { ForbiddenError, UnauthorizedError } from "../../common/errors.js";
import { ExperimentsService } from "./service.js";

export async function getResolvedFlags(app: FastifyInstance, userId: string) {
  return new ExperimentsService(app).listFlagsForUser(userId);
}

export function requireFlag(app: FastifyInstance, flagKey: string) {
  return async (request: { user?: { sub?: string } }) => {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedError();
    }

    const flags = await new ExperimentsService(app).listFlagsForUser(userId);
    const flag = flags.items.find((item) => item.key === flagKey);

    if (!flag?.enabled) {
      throw new ForbiddenError("feature_flag_disabled");
    }
  };
}
