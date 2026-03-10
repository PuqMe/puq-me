import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { guardActionRate } from "../lib/spam.js";

const swipeSchema = z.object({
  targetUserId: z.string().uuid(),
  direction: z.enum(["left", "right", "super"])
});

const swipeRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.authenticate);

  app.post("/", async (request, reply) => {
    const payload = swipeSchema.parse(request.body);
    await guardActionRate(
      app,
      `ratelimit:swipes:${request.user.sub}`,
      app.config.SWIPE_RATE_LIMIT,
      60
    );

    const targetResult = await app.db.query(
      `select id from users where public_id = $1 limit 1`,
      [payload.targetUserId]
    );
    const targetUser = targetResult.rows[0];
    if (!targetUser) {
      return reply.notFound("target_user_not_found");
    }

    if (String(targetUser.id) === request.user.sub) {
      return reply.badRequest("cannot_swipe_self");
    }

    const blocked = await app.db.query(
      `select 1
       from blocked_users
       where (blocker_user_id = $1 and blocked_user_id = $2)
          or (blocker_user_id = $2 and blocked_user_id = $1)
       limit 1`,
      [request.user.sub, targetUser.id]
    );

    if (blocked.rowCount) {
      return reply.forbidden("blocked_interaction");
    }

    const client = await app.db.connect();
    try {
      await client.query("begin");
      await client.query(
        `insert into swipes (actor_user_id, target_user_id, direction)
         values ($1, $2, $3)
         on conflict (actor_user_id, target_user_id)
         do update set direction = excluded.direction, created_at = now()`,
        [request.user.sub, targetUser.id, payload.direction]
      );

      let matchPublic = null;
      if (payload.direction !== "left") {
        const reverseSwipe = await client.query(
          `select 1
           from swipes
           where actor_user_id = $1
             and target_user_id = $2
             and direction in ('right', 'super')
           limit 1`,
          [targetUser.id, request.user.sub]
        );

        if (reverseSwipe.rowCount) {
          const low = Math.min(Number(request.user.sub), Number(targetUser.id));
          const high = Math.max(Number(request.user.sub), Number(targetUser.id));
          const matchResult = await client.query(
            `insert into matches (user_low_id, user_high_id)
             values ($1, $2)
             on conflict (user_low_id, user_high_id)
             do update set status = 'active'
             returning id`,
            [low, high]
          );
          const matchId = matchResult.rows[0].id;

          await client.query(
            `insert into chat_threads (match_id)
             values ($1)
             on conflict (match_id) do nothing`,
            [matchId]
          );

          await client.query(
            `insert into match_participants (match_id, user_id)
             values ($1, $2), ($1, $3)
             on conflict do nothing`,
            [matchId, request.user.sub, targetUser.id]
          );

          matchPublic = matchId;
        }
      }

      await client.query("commit");
      return reply.code(201).send({
        ok: true,
        isMatch: Boolean(matchPublic),
        matchId: matchPublic
      });
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  });
};

export default swipeRoutes;
