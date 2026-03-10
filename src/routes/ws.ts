import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { isThreadParticipant, publishTyping, setPresence } from "../lib/chat.js";

const querySchema = z.object({
  token: z.string().min(1),
  threadId: z.coerce.number().int().positive()
});

const incomingEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("typing"),
    payload: z.object({
      isTyping: z.boolean()
    })
  }),
  z.object({
    type: z.literal("message.status"),
    payload: z.object({
      messageId: z.number().int().positive(),
      status: z.enum(["delivered", "read"])
    })
  })
]);

const wsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/chat", { websocket: true }, (socket, request) => {
    void (async () => {
      const query = querySchema.parse(request.query);
      const user = await app.jwt.verify<{ sub: string }>(query.token);
      if (!(await isThreadParticipant(app, query.threadId, user.sub))) {
        socket.close(4003, "forbidden");
        return;
      }

      const subscriber = app.redis.duplicate();
      await subscriber.subscribe(`thread:${query.threadId}:events`);
      subscriber.on("message", (_channel, message) => {
        socket.send(message);
      });

      await setPresence(app, query.threadId, user.sub, "online");

      socket.on("message", async (raw) => {
        try {
          const event = incomingEventSchema.parse(JSON.parse(raw.toString()));

          if (event.type === "typing") {
            await publishTyping(app, query.threadId, user.sub, event.payload.isTyping);
            return;
          }

          const statusResult = await app.db.query(
            `update messages
             set delivery_status = case
                  when $4 = 'read' then 'read'
                  when delivery_status = 'sent' and $4 = 'delivered' then 'delivered'
                  else delivery_status
                 end,
                 delivered_at = case
                  when $4 in ('delivered', 'read') and delivered_at is null then now()
                  else delivered_at
                 end,
                 read_at = case
                  when $4 = 'read' and read_at is null then now()
                  else read_at
                 end
             where id = $1
               and thread_id = $2
               and sender_user_id <> $3
             returning id, thread_id, delivery_status, coalesce(read_at, delivered_at, now()) as updated_at`,
            [event.payload.messageId, query.threadId, user.sub, event.payload.status]
          );

          if (statusResult.rowCount) {
            socket.send(
              JSON.stringify({
                type: "ack",
                payload: { ok: true }
              })
            );
            await app.redis.publish(
              `thread:${query.threadId}:events`,
              JSON.stringify({
                type: "message.status",
                payload: {
                  threadId: statusResult.rows[0].thread_id,
                  messageId: statusResult.rows[0].id,
                  userId: user.sub,
                  status: statusResult.rows[0].delivery_status,
                  updatedAt: statusResult.rows[0].updated_at
                }
              })
            );
          }
        } catch {
          socket.send(
            JSON.stringify({
              type: "error",
              payload: {
                code: "invalid_event"
              }
            })
          );
        }
      });

      const pingInterval = setInterval(() => {
        if (socket.readyState === 1) {
          socket.ping();
        }
      }, app.config.WEBSOCKET_PING_MS);

      socket.on("close", async () => {
        clearInterval(pingInterval);
        await publishTyping(app, query.threadId, user.sub, false);
        await setPresence(app, query.threadId, user.sub, "offline");
        await subscriber.quit();
      });
    })().catch(() => {
      socket.close(4001, "unauthorized");
    });
  });
};

export default wsRoutes;
