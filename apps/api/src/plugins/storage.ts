import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { S3Client } from "@aws-sdk/client-s3";

const storagePlugin: FastifyPluginAsync = async (app) => {
  const client = new S3Client({
    endpoint: app.config.S3_ENDPOINT,
    region: app.config.S3_REGION,
    forcePathStyle: true,
    credentials: {
      accessKeyId: app.config.S3_ACCESS_KEY,
      secretAccessKey: app.config.S3_SECRET_KEY
    }
  });

  app.decorate("storage", client);
};

export default fp(storagePlugin);
