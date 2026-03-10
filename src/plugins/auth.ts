import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import fastifyJwt from "@fastify/jwt";

const authPlugin: FastifyPluginAsync = async (app) => {
  await app.register(fastifyJwt, {
    secret: app.config.JWT_SECRET,
    sign: {
      expiresIn: app.config.JWT_EXPIRES_IN
    }
  });

  app.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.unauthorized("invalid_or_missing_token");
    }
  });
};

export default fp(authPlugin);
