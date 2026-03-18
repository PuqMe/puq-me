import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { randomUUID } from "node:crypto";

type MockChatMessage = {
  id: number;
  threadId: number;
  senderUserId: string;
  senderPublicId: string;
  messageType: "text" | "image";
  body: string | null;
  imageUrl: string | null;
  moderationStatus: "approved";
  deliveryStatus: "sent";
  sentAt: string;
  deliveredAt: null;
  readAt: null;
};

const initialMessages: MockChatMessage[] = [
  {
    id: 1,
    threadId: 1,
    senderUserId: "202",
    senderPublicId: "demo-peer",
    messageType: "text",
    body: "Perfekt fuer den lokalen Demo-Chat. Schreib mir einfach direkt zurueck.",
    imageUrl: null,
    moderationStatus: "approved",
    deliveryStatus: "sent",
    sentAt: new Date().toISOString(),
    deliveredAt: null,
    readAt: null
  }
];

let nextMessageId = 2;
const messageStore = new Map<number, MockChatMessage[]>();
messageStore.set(1, initialMessages);
const mockUsers = new Map<string, { id: string; email: string; password: string; status: string }>();

function buildMockAuthResponse(user: { id: string; email: string; status: string }) {
  return {
    user: {
      id: user.id,
      email: user.email,
      status: user.status
    },
    tokens: {
      accessToken: `mock-access-${user.id}`,
      refreshToken: `mock-refresh-${user.id}`,
      expiresIn: "15m",
      refreshExpiresIn: "30d"
    }
  };
}

const devMockPlugin: FastifyPluginAsync = async (app) => {
  app.get("/health/live", async () => ({
    status: "ok",
    mode: "mock"
  }));

  app.get("/v1/health/live", async () => ({
    status: "ok",
    mode: "mock"
  }));

  app.post("/v1/auth/register", async (request, reply) => {
    const payload = request.body as {
      email?: string;
      password?: string;
    };

    const email = payload.email?.trim().toLowerCase();
    const password = payload.password ?? "";

    if (!email || !password) {
      return reply.code(400).send({ error: "validation_error", message: "Email and password are required." });
    }

    if (mockUsers.has(email)) {
      return reply.code(409).send({ error: "email_already_registered", message: "This email is already registered." });
    }

    const user = {
      id: randomUUID(),
      email,
      password,
      status: "pending"
    };

    mockUsers.set(email, user);
    return reply.code(201).send(buildMockAuthResponse(user));
  });

  app.post("/v1/auth/login", async (request, reply) => {
    const payload = request.body as {
      email?: string;
      password?: string;
    };

    const email = payload.email?.trim().toLowerCase();
    const password = payload.password ?? "";
    const existingUser = email ? mockUsers.get(email) : null;

    if (!existingUser || existingUser.password !== password) {
      return reply.code(401).send({ error: "invalid_credentials", message: "Email or password is incorrect." });
    }

    return buildMockAuthResponse(existingUser);
  });

  app.post("/v1/auth/google", async (request) => {
    const payload = request.body as {
      credential?: string;
    };

    const suffix = payload.credential?.slice(-8) ?? "demo";
    const email = `google-${suffix}@puq.me`;
    const existingUser = mockUsers.get(email);

    if (existingUser) {
      return buildMockAuthResponse(existingUser);
    }

    const user = {
      id: randomUUID(),
      email,
      password: "",
      status: "active"
    };

    mockUsers.set(email, user);
    return buildMockAuthResponse(user);
  });

  app.post("/v1/auth/refresh", async (request) => {
    const payload = request.body as {
      refreshToken?: string;
    };
    const userId = payload.refreshToken?.replace("mock-refresh-", "");
    const user = [...mockUsers.values()].find((entry) => entry.id === userId);

    if (!user) {
      return { error: "invalid_refresh_token", message: "Refresh token is invalid." };
    }

    return buildMockAuthResponse(user);
  });

  app.post("/v1/auth/logout", async () => ({
    message: "logged_out"
  }));

  app.get("/v1/chat/messages", async (request) => {
    const threadId = Number((request.query as { threadId?: string }).threadId ?? 1);
    return messageStore.get(threadId) ?? [];
  });

  app.post("/v1/chat/messages", async (request, reply) => {
    const payload = request.body as {
      threadId?: number;
      messageType?: "text" | "image";
      body?: string | null;
      imageUrl?: string | null;
    };

    const threadId = payload.threadId ?? 1;
    const message: MockChatMessage = {
      id: nextMessageId++,
      threadId,
      senderUserId: "101",
      senderPublicId: "demo-self",
      messageType: payload.messageType ?? "text",
      body: payload.body ?? null,
      imageUrl: payload.imageUrl ?? null,
      moderationStatus: "approved",
      deliveryStatus: "sent",
      sentAt: new Date().toISOString(),
      deliveredAt: null,
      readAt: null
    };

    const messages = messageStore.get(threadId) ?? [];
    messages.push(message);
    messageStore.set(threadId, messages);

    return reply.code(201).send(message);
  });
};

export default fp(devMockPlugin);
