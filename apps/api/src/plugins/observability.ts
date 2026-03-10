import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";

const observabilityPlugin: FastifyPluginAsync = async (app) => {
  await app.register(sensible);
  await app.register(cors, {
    origin: [app.config.APP_ORIGIN]
  });
  await app.register(helmet);

  app.addHook("onRequest", async (request) => {
    request.log.info(
      {
        method: request.method,
        url: request.url
      },
      "request received"
    );
  });
};

export default fp(observabilityPlugin);
