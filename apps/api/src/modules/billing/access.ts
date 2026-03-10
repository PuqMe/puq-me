import type { FastifyInstance, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../../common/errors.js";
import { BillingService } from "./service.js";
import type { FeatureCode } from "./schema.js";

export function requireFeature(app: FastifyInstance, featureCode: FeatureCode) {
  return async (request: FastifyRequest) => {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedError();
    }

    await new BillingService(app).assertFeatureAccess(userId, featureCode);
  };
}
