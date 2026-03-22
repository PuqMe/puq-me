/**
 * PuQ.me API Worker
 * Cloudflare Workers + D1 + KV + Durable Objects
 *
 * Replaces: Fastify + PostgreSQL + Redis + Docker
 * Zero ongoing costs on Cloudflare Free Plan.
 */

import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import type { AppContext } from "./env.js";
import { createCors } from "./middleware/cors.js";
import { AppError } from "./lib/errors.js";

// Route modules
import health from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import profiles from "./routes/profiles.js";
import media from "./routes/media.js";
import swipe from "./routes/swipe.js";
import matchRoutes from "./routes/match.js";
import chat from "./routes/chat.js";
import notifications from "./routes/notifications.js";

// Durable Objects
export { ChatRoom } from "./durable/chat-room.js";

// Create Hono app
const app = new Hono<AppContext>();

// Global middleware
app.use("*", createCors());
app.use("*", secureHeaders());

// Mount routes with the same prefixes as the Fastify backend
app.route("/health", health);
app.route("/v1/auth", authRoutes);
app.route("/v1/profiles", profiles);
app.route("/", media); // Media routes have empty prefix, paths include /upload/* and /v1/media/*
app.route("/v1/swipe", swipe);
app.route("/v1/matches", matchRoutes);
app.route("/v1/chat", chat);
app.route("/v1/notifications", notifications);

// WebSocket upgrade handler
app.get("/v1/ws", async (c) => {
  const upgradeHeader = c.req.header("Upgrade");
  if (upgradeHeader !== "websocket") {
    return c.text("Expected WebSocket", 426);
  }

  const conversationId = c.req.query("conversationId");
  const userId = c.req.query("userId");

  if (!conversationId || !userId) {
    return c.text("Missing conversationId or userId", 400);
  }

  // Route to the appropriate ChatRoom Durable Object
  const roomId = c.env.CHAT_ROOM.idFromName(`conversation:${conversationId}`);
  const room = c.env.CHAT_ROOM.get(roomId);

  // Forward the WebSocket upgrade request to the Durable Object
  const url = new URL(c.req.url);
  url.pathname = "/";
  url.searchParams.set("userId", userId);

  return room.fetch(new Request(url.toString(), {
    headers: c.req.raw.headers,
  }));
});

// Global error handler
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json(err.toJSON(), err.status as any);
  }

  // Zod validation errors
  if (err.constructor.name === "ZodError") {
    return c.json({
      error: {
        code: "validation_error",
        message: "Invalid request data",
        details: (err as any).errors
      }
    }, 400);
  }

  console.error("Unhandled error:", err);
  return c.json({
    error: {
      code: "internal_error",
      message: "An unexpected error occurred"
    }
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: {
      code: "not_found",
      message: "Route not found"
    }
  }, 404);
});

export default app;
