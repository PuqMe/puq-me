/**
 * S3/IDrive E2 storage service for Cloudflare Workers.
 * Uses AWS SDK for presigned URL generation.
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Env } from "../env.js";
import { BadRequestError, TooManyRequestsError } from "./errors.js";

const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

type UploadPurpose = "avatar" | "image" | "chat_media";

type UploadPolicy = {
  basePath: string;
  maxBytes: number;
};

const UPLOAD_POLICIES: Record<UploadPurpose, UploadPolicy> = {
  avatar: { basePath: "avatars", maxBytes: 5 * 1024 * 1024 },
  image: { basePath: "images", maxBytes: 10 * 1024 * 1024 },
  chat_media: { basePath: "chat", maxBytes: 25 * 1024 * 1024 }
};

function getExtension(contentType: string): string {
  switch (contentType) {
    case "image/jpeg": return "jpg";
    case "image/png": return "png";
    case "image/webp": return "webp";
    default: throw new BadRequestError("unsupported_media_type");
  }
}

function createS3Client(env: Env): S3Client {
  return new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_SECRET_KEY
    }
  });
}

export async function createSignedUpload(
  env: Env,
  userId: string,
  purpose: UploadPurpose,
  body: { contentType: string; fileName: string; sizeBytes: number }
) {
  const policy = UPLOAD_POLICIES[purpose];

  if (!ACCEPTED_MIME_TYPES.includes(body.contentType as AcceptedMimeType)) {
    throw new BadRequestError("unsupported_media_type", { acceptedMimeTypes: [...ACCEPTED_MIME_TYPES] });
  }

  if (body.sizeBytes > policy.maxBytes) {
    throw new BadRequestError("file_too_large", { maxUploadSizeBytes: policy.maxBytes });
  }

  // Rate limiting via KV
  const rateKey = `upload:rate:${purpose}:${userId}`;
  const currentCount = parseInt((await env.KV.get(rateKey)) ?? "0", 10);
  if (currentCount >= 60) {
    throw new TooManyRequestsError("upload_rate_limit_exceeded", { purpose });
  }
  await env.KV.put(rateKey, String(currentCount + 1), { expirationTtl: 600 });

  const extension = getExtension(body.contentType);
  const stamp = new Date().toISOString().slice(0, 10);
  const objectKey = `${policy.basePath}/${userId}/${stamp}/${crypto.randomUUID()}.${extension}`;
  const uploadId = crypto.randomUUID();

  const s3 = createS3Client(env);
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: objectKey,
      ContentType: body.contentType,
      ContentLength: body.sizeBytes,
      Metadata: {
        uploadId,
        uploadPurpose: purpose,
        ownerId: userId,
        scanStatus: "pending"
      }
    }),
    { expiresIn: 600 }
  );

  const cdnBaseUrl = env.CDN_BASE_URL.replace(/\/$/, "");

  return {
    uploadId,
    purpose,
    bucket: env.S3_BUCKET,
    objectKey,
    uploadUrl,
    publicUrl: `${cdnBaseUrl}/${objectKey}`,
    expiresInSeconds: 600,
    maxUploadSizeBytes: policy.maxBytes,
    acceptedMimeTypes: [...ACCEPTED_MIME_TYPES],
    requiredHeaders: {
      "content-type": body.contentType,
      "x-amz-meta-upload-id": uploadId,
      "x-amz-meta-upload-purpose": purpose,
      "x-amz-meta-owner-id": userId,
      "x-amz-meta-scan-status": "pending"
    },
    security: {
      signedUrl: true,
      moderationRequired: true,
      publicDeliveryRequiresApproval: true
    }
  };
}

export async function deleteObject(env: Env, objectKey: string) {
  const s3 = createS3Client(env);
  await s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: objectKey }));
}
