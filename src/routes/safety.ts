import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const reportSchema = z.object({
  targetUserId: z.string().uuid(),
  reason: z.enum(["spam", "harassment", "fake_profile", "nudity", "other"]),
  details: z.string().max(1000).optional()
});

const blockSchema = z.object({
  targetUserId: z.string().uuid()
});

const safetyRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.authenticate);

  app.post("/report", async (request, reply) => {
    const payload = reportSchema.parse(request.body);
    const target = await app.db.query(
      `select id from users where public_id = $1 limit 1`,
      [payload.targetUserId]
    );

    if (!target.rowCount) {
      return reply.notFound("target_user_not_found");
    }

    await app.db.query(
      `insert into reports (reporter_user_id, target_user_id, reason, details)
       values ($1, $2, $3, $4)`,
      [request.user.sub, target.rows[0].id, payload.reason, payload.details ?? null]
    );

    return reply.code(201).send({ ok: true });
  });

  app.post("/block", async (request, reply) => {
    const payload = blockSchema.parse(request.body);
    const target = await app.db.query(
      `select id from users where public_id = $1 limit 1`,
      [payload.targetUserId]
    );

    if (!target.rowCount) {
      return reply.notFound("target_user_not_found");
    }

    await app.db.query(
      `insert into blocked_users (blocker_user_id, blocked_user_id)
       values ($1, $2)
       on conflict do nothing`,
      [request.user.sub, target.rows[0].id]
    );

    return reply.code(201).send({ ok: true });
  });
};

export default safetyRoutes;
