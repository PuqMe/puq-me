import "fastify";
import type { Redis } from "ioredis";
import type { Pool } from "pg";
import type { AppConfig, JwtUser } from "../config.js";

declare module "fastify" {
  interface FastifyInstance {
    config: AppConfig;
    db: Pool;
    redis: Redis;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user: JwtUser;
  }
}
