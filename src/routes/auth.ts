import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { newPublicId } from "../lib/ids.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(128),
  displayName: z.string().min(2).max(80),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(128)
});

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/register", async (request, reply) => {
    const payload = registerSchema.parse(request.body);
    const passwordHash = hashPassword(payload.password);

    const client = await app.db.connect();
    try {
      await client.query("begin");
      const userResult = await client.query(
        `insert into users (public_id, email, password_hash)
         values ($1, $2, $3)
         returning id, public_id, email`,
        [newPublicId(), payload.email, passwordHash]
      );

      const user = userResult.rows[0];

      await client.query(
        `insert into profiles (user_id, display_name, birth_date)
         values ($1, $2, $3)`,
        [user.id, payload.displayName, payload.birthDate]
      );

      await client.query("commit");

      const token = await reply.jwtSign({
        sub: String(user.id),
        email: user.email
      });

      return reply.code(201).send({
        token,
        user: {
          id: user.public_id,
          email: user.email
        }
      });
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  });

  app.post("/login", async (request, reply) => {
    const payload = loginSchema.parse(request.body);
    const result = await app.db.query(
      `select id, public_id, email, password_hash
       from users
       where email = $1
       limit 1`,
      [payload.email]
    );

    const user = result.rows[0];
    if (!user || !verifyPassword(payload.password, user.password_hash)) {
      return reply.unauthorized("invalid_credentials");
    }

    const token = await reply.jwtSign({
      sub: String(user.id),
      email: user.email
    });

    return {
      token,
      user: {
        id: user.public_id,
        email: user.email
      }
    };
  });

  app.get("/me", { preHandler: [app.authenticate] }, async (request) => {
    const result = await app.db.query(
      `select u.public_id, u.email, p.display_name, p.bio, p.gender, p.interested_in
       from users u
       join profiles p on p.user_id = u.id
       where u.id = $1`,
      [request.user.sub]
    );

    return result.rows[0];
  });
};

export default authRoutes;
