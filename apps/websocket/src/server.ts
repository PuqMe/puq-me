import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { loadBaseConfig } from "@puqme/config";
import type { ChatEvent } from "@puqme/types";

const config = loadBaseConfig();
const app = Fastify({
  logger: {
    transport:
      process.env.NODE_ENV === "development"
        ? {
            target: "pino-pretty"
          }
        : undefined
  }
});

await app.register(websocket);

app.get("/health/live", async () => ({ status: "ok" }));

app.get("/ws/chat", { websocket: true }, (socket) => {
  const welcomeEvent: ChatEvent = {
    type: "typing",
    payload: {
      threadId: "demo",
      isTyping: false
    }
  };

  socket.send(JSON.stringify(welcomeEvent));
});

await app.listen({
  host: "0.0.0.0",
  port: config.PORT
});
