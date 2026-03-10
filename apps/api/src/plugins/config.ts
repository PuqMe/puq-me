import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { loadApiConfig } from "../config.js";

const configPlugin: FastifyPluginAsync = async (app) => {
  app.decorate("config", loadApiConfig());
};

export default fp(configPlugin);
