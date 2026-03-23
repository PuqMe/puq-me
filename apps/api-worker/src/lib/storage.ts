/**
 * S3/IDrive E2 storage service for Cloudflare Workers.
 * Minimal implementation using raw fetch with AWS Signature V4.
 * No external SDK dependency - keeps bundle size small.
 */

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

// --- Minimal AWS Signature V4 implementation ---

async function hmacSha256(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

async function sha256Hex(data: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function toAmzDate(date: Date): { amzDate: string; dateStamp: string } {
  const iso = date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return { amzDate: iso, dateStamp: iso.slice(0, 8) };
}

async function signV4(
  method: string,
  url: string,
  region: string,
  service: string,
  accessKey: string,
  secretKey: string,
  headers: Record<string, string>,
  payloadHash: string,
  expiresIn?: number
): Promise<string> {
  const parsed = new URL(url);
  const { amzDate, dateStamp } = toAmzDate(new Date());
  const credential = `${accessKey}/${dateStamp}/${region}/${service}/aws4_request`;

  // For presigned URLs
  const qp = new URLSearchParams(parsed.search);
  qp.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
  qp.set("X-Amz-Credential", credential);
  qp.set("X-Amz-Date", amzDate);
  qp.set("X-Amz-Expires", String(expiresIn ?? 600));
  qp.set("X-Amz-SignedHeaders", "host");

  // Add custom headers as query params for presigned URL
  for (const [k, v] of Object.entries(headers)) {
    if (k.startsWith("x-amz-meta-") || k === "content-type" || k === "content-length") {
      qp.set(k, v);
    }
  }

  // Sort query params
  const sortedParams = new URLSearchParams([...qp.entries()].sort((a, b) => a[0].localeCompare(b[0])));

  const canonicalRequest = [
    method,
    parsed.pathname,
    sortedParams.toString(),
    `host:${parsed.host}\n`,
    "host",
    "UNSIGNED-PAYLOAD"
  ].join("\n");

  const canonicalHash = await sha256Hex(canonicalRequest);
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    `${dateStamp}/${region}/${service}/aws4_request`,
    canonicalHash
  ].join("\n");

  // Derive signing key
  let signingKey: ArrayBuffer = await hmacSha256(
    new TextEncoder().encode("AWS4" + secretKey), dateStamp
  );
  signingKey = await hmacSha256(signingKey, region);
  signingKey = await hmacSha256(signingKey, service);
  signingKey = await hmacSha256(signingKey, "aws4_request");

  const signature = [...new Uint8Array(await hmacSha256(signingKey, stringToSign))]
    .map(b => b.toString(16).padStart(2, "0")).join("");

  sortedParams.set("X-Amz-Signature", signature);
  return `${parsed.origin}${parsed.pathname}?${sortedParams.toString()}`;
}

async function createPresignedPutUrl(
  env: Env,
  objectKey: string,
  contentType: string,
  contentLength: number,
  metadata: Record<string, string>,
  expiresIn = 600
): Promise<string> {
  const endpoint = env.S3_ENDPOINT.replace(/\/$/, "");
  const url = `${endpoint}/${env.S3_BUCKET}/${objectKey}`;

  const headers: Record<string, string> = {
    "content-type": contentType,
    "content-length": String(contentLength),
  };
  for (const [k, v] of Object.entries(metadata)) {
    headers[`x-amz-meta-${k}`] = v;
  }

  return signV4("PUT", url, env.S3_REGION, "s3", env.S3_ACCESS_KEY, env.S3_SECRET_KEY, headers, "UNSIGNED-PAYLOAD", expiresIn);
}

// --- Public API ---

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

  const uploadUrl = await createPresignedPutUrl(env, objectKey, body.contentType, body.sizeBytes, {
    uploadId,
    uploadPurpose: purpose,
    ownerId: userId,
    scanStatus: "pending"
  });

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
  const endpoint = env.S3_ENDPOINT.replace(/\/$/, "");
  const url = `${endpoint}/${env.S3_BUCKET}/${objectKey}`;

  const { amzDate, dateStamp } = toAmzDate(new Date());
  const signedUrl = await signV4(
    "DELETE", url, env.S3_REGION, "s3",
    env.S3_ACCESS_KEY, env.S3_SECRET_KEY, {}, "UNSIGNED-PAYLOAD"
  );

  await fetch(signedUrl, { method: "DELETE" });
}
