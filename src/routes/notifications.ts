import type { FastifyPluginAsync } from "fastify";

const notificationRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.authenticate);

  app.get("/", async (request) => {
    const result = await app.db.query(
      `select id, type, payload, status, created_at
       from notifications
       where user_id = $1
       order by created_at desc
       limit 100`,
      [request.user.sub]
    );

    return { items: result.rows };
  });
};

export default notificationRoutes;
