import { randomUUID } from "node:crypto";
import path from "node:path";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { FastifyInstance } from "fastify";
import { BadRequestError, TooManyRequestsError } from "../../common/errors.js";
import type { GenericUploadIntentBody } from "./schema.js";

const acceptedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;

type UploadPurpose = "avatar" | "image" | "chat_media";

type UploadPolicy = {
  bucket: string;
  basePath: string;
  maxBytes: number;
  moderationRequired: boolean;
};

export class StorageService {
  constructor(private readonly app: FastifyInstance) {}

  private uploadRateKey(userId: string, purpose: UploadPurpose) {
    return `storage:upload:${purpose}:${userId}`;
  }

  private async guardUploadRate(userId: string, purpose: UploadPurpose) {
    const key = this.uploadRateKey(userId, purpose);
    const count = await this.app.redis.incr(key);
    if (count === 1) {
      await this.app.redis.expire(key, 60 * 10);
    }
    if (count > 60) {
      throw new TooManyRequestsError("upload_rate_limit_exceeded", { purpose });
    }
  }

  private getExtension(contentType: GenericUploadIntentBody["contentType"]) {
    switch (contentType) {
      case "image/jpeg":
        return "jpg";
      case "image/png":
        return "png";
      case "image/webp":
        return "webp";
    }

    throw new BadRequestError("unsupported_media_type");
  }

  private getPolicy(purpose: UploadPurpose): UploadPolicy {
    switch (purpose) {
      case "avatar":
        return {
          bucket: this.app.config.STORAGE_AVATARS_BUCKET!,
          basePath: "avatars",
          maxBytes: this.app.config.UPLOAD_AVATAR_MAX_BYTES,
          moderationRequired: true
        };
      case "image":
        return {
          bucket: this.app.config.STORAGE_IMAGES_BUCKET!,
          basePath: "images",
          maxBytes: this.app.config.UPLOAD_IMAGE_MAX_BYTES,
          moderationRequired: true
        };
      case "chat_media":
        return {
          bucket: this.app.config.STORAGE_CHAT_MEDIA_BUCKET!,
          basePath: "chat",
          maxBytes: this.app.config.UPLOAD_CHAT_MEDIA_MAX_BYTES,
          moderationRequired: true
        };
    }
  }

  private validateUpload(body: GenericUploadIntentBody, policy: UploadPolicy) {
    if (!acceptedMimeTypes.includes(body.contentType)) {
      throw new BadRequestError("unsupported_media_type", {
        acceptedMimeTypes
      });
    }

    if (body.sizeBytes > policy.maxBytes) {
      throw new BadRequestError("file_too_large", {
        maxUploadSizeBytes: policy.maxBytes
      });
    }

    const extension = path.extname(body.fileName).replace(".", "").toLowerCase();
    if (extension && !["jpg", "jpeg", "png", "webp"].includes(extension)) {
      throw new BadRequestError("invalid_file_extension");
    }
  }

  private buildObjectKey(userId: string, purpose: UploadPurpose, extension: string) {
    const policy = this.getPolicy(purpose);
    const stamp = new Date().toISOString().slice(0, 10);
    return `${policy.basePath}/${userId}/${stamp}/${randomUUID()}.${extension}`;
  }

  private buildPublicUrl(objectKey: string) {
    return `${this.app.config.CDN_BASE_URL!.replace(/\/$/, "")}/${objectKey}`;
  }

  async createSignedUpload(userId: string, purpose: UploadPurpose, body: GenericUploadIntentBody) {
    const policy = this.getPolicy(purpose);
    this.validateUpload(body, policy);
    await this.guardUploadRate(userId, purpose);

    const extension = this.getExtension(body.contentType);
    const objectKey = this.buildObjectKey(userId, purpose, extension);
    const uploadId = randomUUID();
    const requiredHeaders = {
      "content-type": body.contentType,
      "x-amz-meta-upload-id": uploadId,
      "x-amz-meta-upload-purpose": purpose,
      "x-amz-meta-owner-id": userId,
      "x-amz-meta-scan-status": "pending"
    };

    const uploadUrl = await getSignedUrl(
      this.app.storage,
      new PutObjectCommand({
        Bucket: policy.bucket,
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
      { expiresIn: 60 * 10 }
    );

    this.app.log.info(
      {
        event: "storage.upload.intent.created",
        userId,
        purpose,
        bucket: policy.bucket,
        objectKey,
        malwareScanHookConfigured: Boolean(this.app.config.MALWARE_SCAN_HOOK_URL)
      },
      "signed upload intent issued"
    );

    return {
      uploadId,
      purpose,
      bucket: policy.bucket,
      objectKey,
      uploadUrl,
      publicUrl: this.buildPublicUrl(objectKey),
      expiresInSeconds: 60 * 10,
      maxUploadSizeBytes: policy.maxBytes,
      acceptedMimeTypes: [...acceptedMimeTypes],
      requiredHeaders,
      security: {
        signedUrl: true,
        malwareScanHookConfigured: Boolean(this.app.config.MALWARE_SCAN_HOOK_URL),
        moderationRequired: policy.moderationRequired,
        publicDeliveryRequiresApproval: true
      }
    };
  }

  async deleteObject(bucket: string, objectKey: string) {
    await this.app.storage.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: objectKey
      })
    );
  }
}
