import Fastify from "fastify";
import configPlugin from "./plugins/config.js";
import observabilityPlugin from "./plugins/observability.js";
import postgresPlugin from "./plugins/postgres.js";
import redisPlugin from "./plugins/redis.js";
import jwtPlugin from "./plugins/jwt.js";
import storagePlugin from "./plugins/storage.js";
import rateLimitPlugin from "./plugins/rate-limit.js";
import { handleRouteError } from "./common/http.js";
import { registerModules } from "./common/module.js";
import { modules } from "./modules/index.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
      transport:
        process.env.NODE_ENV === "development"
          ? {
              target: "pino-pretty"
            }
          : undefined
    },
    trustProxy: true
  });

  await app.register(configPlugin);
  await app.register(observabilityPlugin);
  await app.register(postgresPlugin);
  await app.register(redisPlugin);
  await app.register(jwtPlugin);
  await app.register(storagePlugin);
  await app.register(rateLimitPlugin);

  await registerModules(app, modules);

  app.setErrorHandler((error, request, reply) => {
    handleRouteError(error, request, reply);
  });

  return app;
}
