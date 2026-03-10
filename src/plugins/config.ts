import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { loadConfig } from "../config.js";

const configPlugin: FastifyPluginAsync = async (app) => {
  app.decorate("config", loadConfig());
};

export default fp(configPlugin);
