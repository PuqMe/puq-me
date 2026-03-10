import type { FastifyPluginAsync } from "fastify";
import {
  conversationIdParamsSchema,
  listMessagesQuerySchema,
  markConversationReadBodySchema,
  sendMessageBodySchema
} from "./schema.js";
import { ChatService } from "./service.js";

const routes: FastifyPluginAsync = async (app) => {
  const service = new ChatService(app);

  app.get("/conversations", { preHandler: [app.authenticate] }, async (request) => {
    return service.listConversations(request.user?.sub ?? "anonymous");
  });

  app.get("/conversations/unread-count", { preHandler: [app.authenticate] }, async (request) => {
    return service.getUnreadCount(request.user?.sub ?? "anonymous");
  });

  app.get("/conversations/:conversationId/messages", { preHandler: [app.authenticate] }, async (request) => {
    const params = conversationIdParamsSchema.parse(request.params);
    const query = listMessagesQuerySchema.parse(request.query);
    return service.listMessages(request.user?.sub ?? "anonymous", params.conversationId, query);
  });

  app.post("/messages", { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = sendMessageBodySchema.parse(request.body);
    const result = await service.sendMessage(request.user?.sub ?? "anonymous", payload);
    return reply.code(201).send(result);
  });

  app.post("/conversations/read", { preHandler: [app.authenticate] }, async (request) => {
    const payload = markConversationReadBodySchema.parse(request.body);
    return service.markConversationRead(request.user?.sub ?? "anonymous", payload.conversationId);
  });
};

export default routes;
