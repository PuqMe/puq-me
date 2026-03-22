/**
 * Durable Object for real-time chat via WebSocket.
 * Replaces Redis pub/sub + WebSocket server.
 *
 * Each ChatRoom instance handles one conversation.
 * Users connect via WebSocket and receive real-time events:
 * - new messages
 * - typing indicators
 * - read receipts
 * - presence updates
 */

import type { Env } from "../env.js";

type WebSocketSession = {
  userId: string;
  socket: WebSocket;
  connectedAt: number;
};

export class ChatRoom implements DurableObject {
  private sessions: Map<string, WebSocketSession> = new Map();
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // POST /broadcast - send event to all connected clients
    if (request.method === "POST" && url.pathname === "/broadcast") {
      const event = await request.json();
      this.broadcast(event as Record<string, unknown>, (event as any).excludeUserId);
      return new Response("ok");
    }

    // WebSocket upgrade
    if (request.headers.get("Upgrade") === "websocket") {
      const userId = url.searchParams.get("userId");
      if (!userId) {
        return new Response("Missing userId", { status: 400 });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.state.acceptWebSocket(server);

      this.sessions.set(userId, {
        userId,
        socket: server,
        connectedAt: Date.now()
      });

      // Notify others about presence
      this.broadcast(
        { type: "presence.online", userId, timestamp: new Date().toISOString() },
        userId
      );

      server.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data as string);
          this.handleMessage(userId, data);
        } catch {
          // Ignore malformed messages
        }
      });

      server.addEventListener("close", () => {
        this.sessions.delete(userId);
        this.broadcast(
          { type: "presence.offline", userId, timestamp: new Date().toISOString() },
          userId
        );
      });

      server.addEventListener("error", () => {
        this.sessions.delete(userId);
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response("Not found", { status: 404 });
  }

  private handleMessage(userId: string, data: Record<string, unknown>) {
    switch (data.type) {
      case "typing.start":
        this.broadcast(
          { type: "typing.start", userId, conversationId: data.conversationId, timestamp: new Date().toISOString() },
          userId
        );
        break;

      case "typing.stop":
        this.broadcast(
          { type: "typing.stop", userId, conversationId: data.conversationId, timestamp: new Date().toISOString() },
          userId
        );
        break;

      case "ping":
        this.sessions.get(userId)?.socket.send(
          JSON.stringify({ type: "pong", timestamp: new Date().toISOString() })
        );
        break;
    }
  }

  private broadcast(event: Record<string, unknown>, excludeUserId?: string) {
    const message = JSON.stringify(event);

    for (const [userId, session] of this.sessions) {
      if (userId === excludeUserId) continue;

      try {
        session.socket.send(message);
      } catch {
        // Socket closed, clean up
        this.sessions.delete(userId);
      }
    }
  }

  // Called by Durable Object runtime for hibernation
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    // Find which user this socket belongs to
    for (const [userId, session] of this.sessions) {
      if (session.socket === ws) {
        try {
          const data = JSON.parse(message as string);
          this.handleMessage(userId, data);
        } catch {
          // Ignore malformed
        }
        break;
      }
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    for (const [userId, session] of this.sessions) {
      if (session.socket === ws) {
        this.sessions.delete(userId);
        this.broadcast(
          { type: "presence.offline", userId, timestamp: new Date().toISOString() },
          userId
        );
        break;
      }
    }
  }
}
