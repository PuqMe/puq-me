import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { ZodError } from "zod";
import configPlugin from "./plugins/config.js";
import dbPlugin from "./plugins/db.js";
import redisPlugin from "./plugins/redis.js";
import authPlugin from "./plugins/auth.js";
import securityPlugin from "./plugins/security.js";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import photoRoutes from "./routes/photos.js";
import swipeRoutes from "./routes/swipes.js";
import matchRoutes from "./routes/matches.js";
import chatRoutes from "./routes/chat.js";
import wsRoutes from "./routes/ws.js";
import notificationRoutes from "./routes/notifications.js";
import safetyRoutes from "./routes/safety.js";

export async function buildApp() {
  const app = Fastify({
    trustProxy: true,
    logger: {
      level: process.env.LOG_LEVEL ?? "info"
    }
  });

  await app.register(configPlugin);
  await app.register(redisPlugin);
  await app.register(securityPlugin);
  await app.register(dbPlugin);
  await app.register(authPlugin);
  await app.register(websocket);

  app.register(healthRoutes, { prefix: "/health" });
  app.register(authRoutes, { prefix: "/v1/auth" });
  app.register(profileRoutes, { prefix: "/v1/profile" });
  app.register(photoRoutes, { prefix: "/v1/photos" });
  app.register(swipeRoutes, { prefix: "/v1/swipes" });
  app.register(matchRoutes, { prefix: "/v1/matches" });
  app.register(chatRoutes, { prefix: "/v1/chat" });
  app.register(notificationRoutes, { prefix: "/v1/notifications" });
  app.register(safetyRoutes, { prefix: "/v1/safety" });
  app.register(wsRoutes, { prefix: "/ws" });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: "validation_error",
        details: error.flatten()
      });
    }

    app.log.error(error);
    return reply.code(error.statusCode ?? 500).send({
      error: error.statusCode && error.statusCode < 500 ? error.message : "internal_server_error"
    });
  });

  return app;
}
