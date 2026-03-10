import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { Pool } from "pg";

const postgresPlugin: FastifyPluginAsync = async (app) => {
  const pool = new Pool({
    connectionString: app.config.DATABASE_URL,
    max: 20
  });

  app.decorate("db", pool);

  app.addHook("onClose", async () => {
    await pool.end();
  });
};

export default fp(postgresPlugin);
