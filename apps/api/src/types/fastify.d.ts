import "fastify";
import type { Pool } from "pg";
import type { Redis } from "ioredis";
import type { S3Client } from "@aws-sdk/client-s3";
import type { ApiConfig } from "../config.js";

declare module "fastify" {
  interface FastifyInstance {
    config: ApiConfig;
    db: Pool;
    redis: Redis;
    storage: S3Client;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: {
      sub: string;
      email?: string;
      role?: string;
    };
  }
}
