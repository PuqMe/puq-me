import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(80),
  bio: z.string().max(500).optional(),
  gender: z.string().max(32).optional(),
  interestedIn: z.string().max(32).optional(),
  isVisible: z.boolean().optional()
});

const profileRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.authenticate);

  app.get("/", async (request) => {
    const result = await app.db.query(
      `select u.public_id, p.display_name, p.bio, p.gender, p.interested_in, p.is_visible
       from users u
       join profiles p on p.user_id = u.id
       where u.id = $1`,
      [request.user.sub]
    );

    return result.rows[0];
  });

  app.patch("/", async (request) => {
    const payload = updateProfileSchema.parse(request.body);
    const result = await app.db.query(
      `update profiles
       set display_name = $2,
           bio = coalesce($3, bio),
           gender = coalesce($4, gender),
           interested_in = coalesce($5, interested_in),
           is_visible = coalesce($6, is_visible),
           updated_at = now()
       where user_id = $1
       returning display_name, bio, gender, interested_in, is_visible`,
      [
        request.user.sub,
        payload.displayName,
        payload.bio ?? null,
        payload.gender ?? null,
        payload.interestedIn ?? null,
        payload.isVisible ?? null
      ]
    );

    return result.rows[0];
  });
};

export default profileRoutes;
