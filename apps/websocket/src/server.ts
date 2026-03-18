import fs from "node:fs";
import path from "node:path";
import Fastify from "fastify";
import websocket from "@fastify/websocket";

type ChatSocketEvent =
  | {
      type: "message.status";
      payload: {
        threadId: number;
        messageId: number;
        userId: string;
        status: "delivered" | "read";
        updatedAt: string;
      };
    }
  | {
      type: "typing";
      payload: {
        threadId: number;
        userId: string;
        isTyping: boolean;
        expiresAt: string;
      };
    }
  | {
      type: "presence";
      payload: {
        threadId: number;
        userId: string;
        state: "online" | "offline";
        updatedAt: string;
      };
    };

function loadEnv() {
  const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "apps/websocket/.env")
  ];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf8");
      for (const line of fileContents.split("\n")) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) {
          continue;
        }

        const separatorIndex = trimmed.indexOf("=");

        if (separatorIndex === -1) {
          continue;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim().replace(/^"|"$/g, "");

        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnv();

const port = Number(process.env.PORT ?? 3010);
const app = Fastify({
  logger: process.env.NODE_ENV === "development" ? { transport: { target: "pino-pretty" } } : true
});

const threadSockets = new Map<number, Set<WebSocket>>();

function broadcast(threadId: number, event: ChatSocketEvent) {
  const sockets = threadSockets.get(threadId);

  if (!sockets) {
    return;
  }

  const payload = JSON.stringify(event);

  for (const socket of sockets) {
    if (socket.readyState === socket.OPEN) {
      socket.send(payload);
    }
  }
}

await app.register(websocket);

app.get("/health/live", async () => ({ status: "ok" }));

app.get("/ws/chat", { websocket: true }, (socket, request) => {
  const threadId = Number((request.query as { threadId?: string }).threadId ?? 1);
  const userId = "202";
  const sockets = threadSockets.get(threadId) ?? new Set<WebSocket>();
  sockets.add(socket);
  threadSockets.set(threadId, sockets);

  const presenceEvent: ChatSocketEvent = {
    type: "presence",
    payload: {
      threadId,
      userId,
      state: "online",
      updatedAt: new Date().toISOString()
    }
  };

  socket.send(JSON.stringify(presenceEvent));

  socket.on("message", (raw: unknown) => {
    try {
      const data = JSON.parse(String(raw)) as { type?: string; payload?: { isTyping?: boolean; messageId?: number; status?: "delivered" | "read" } };

      if (data.type === "typing") {
        broadcast(threadId, {
          type: "typing",
          payload: {
            threadId,
            userId,
            isTyping: Boolean(data.payload?.isTyping),
            expiresAt: new Date(Date.now() + 1500).toISOString()
          }
        });
      }

      if (data.type === "message.status" && data.payload?.messageId && data.payload.status) {
        broadcast(threadId, {
          type: "message.status",
          payload: {
            threadId,
            messageId: data.payload.messageId,
            userId,
            status: data.payload.status,
            updatedAt: new Date().toISOString()
          }
        });
      }
    } catch {
      return;
    }
  });

  socket.on("close", () => {
    const currentSockets = threadSockets.get(threadId);
    currentSockets?.delete(socket);

    broadcast(threadId, {
      type: "presence",
      payload: {
        threadId,
        userId,
        state: "offline",
        updatedAt: new Date().toISOString()
      }
    });
  });
});

await app.listen({
  host: "0.0.0.0",
  port
});
