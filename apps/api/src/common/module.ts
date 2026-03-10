import type { FastifyInstance, FastifyPluginAsync } from "fastify";

export type AppModule = {
  name: string;
  prefix: string;
  plugin: FastifyPluginAsync;
};

export async function registerModules(app: FastifyInstance, modules: AppModule[]) {
  for (const module of modules) {
    await app.register(module.plugin, { prefix: module.prefix });
    app.log.info({ module: module.name, prefix: module.prefix }, "module registered");
  }
}
