import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { UnauthorizedError } from "../common/errors.js";

const jwtPlugin: FastifyPluginAsync = async (app) => {
  await app.register(fastifyJwt, {
    secret: app.config.JWT_SECRET,
    sign: {
      expiresIn: app.config.JWT_EXPIRES_IN
    }
  });

  app.decorate("authenticate", async (request) => {
    try {
      await request.jwtVerify();
    } catch {
      throw new UnauthorizedError("invalid_or_missing_token");
    }
  });
};

export default fp(jwtPlugin);
