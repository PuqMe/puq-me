import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { Pool } from "pg";

const dbPlugin: FastifyPluginAsync = async (app) => {
  const pool = new Pool({
    connectionString: app.config.DATABASE_URL,
    max: 30,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000
  });

  await pool.query("select 1");

  app.decorate("db", pool);

  app.addHook("onClose", async () => {
    await pool.end();
  });
};

export default fp(dbPlugin);
