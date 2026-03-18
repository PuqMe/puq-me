import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

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

const devMockPlugin: FastifyPluginAsync = async (app) => {
  app.get("/health/live", async () => ({
    status: "ok",
    mode: "mock"
  }));

  app.get("/v1/health/live", async () => ({
    status: "ok",
    mode: "mock"
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
