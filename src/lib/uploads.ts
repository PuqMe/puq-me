import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";

export function buildS3Client(app: FastifyInstance): S3Client {
  return new S3Client({
    endpoint: app.config.S3_ENDPOINT,
    region: app.config.S3_REGION,
    forcePathStyle: true,
    credentials: {
      accessKeyId: app.config.S3_ACCESS_KEY,
      secretAccessKey: app.config.S3_SECRET_KEY
    }
  });
}

export async function createPhotoUploadUrl(app: FastifyInstance, userId: string, contentType: string) {
  const objectKey = `users/${userId}/photos/${randomUUID()}`;
  const client = buildS3Client(app);
  const command = new PutObjectCommand({
    Bucket: app.config.S3_BUCKET,
    Key: objectKey,
    ContentType: contentType,
    Metadata: {
      userId
    }
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: app.config.UPLOAD_URL_TTL_SECONDS
  });

  return {
    objectKey,
    uploadUrl,
    publicUrl: `${app.config.S3_PUBLIC_BASE_URL}/${objectKey}`
  };
}
