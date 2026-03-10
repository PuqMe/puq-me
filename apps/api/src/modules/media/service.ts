import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BadRequestError, TooManyRequestsError } from "../../common/errors.js";
import { MediaRepository } from "./repository.js";
import type { CompleteUploadBody, CreateUploadIntentBody } from "./schema.js";

const acceptedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
const variantDefinitions = [
  { variantName: "original", width: null, height: null },
  { variantName: "thumb", width: 160, height: 160 },
  { variantName: "512w", width: 512, height: null },
  { variantName: "1024w", width: 1024, height: null }
] as const;

export class MediaService {
  private readonly repository: MediaRepository;

  constructor(private readonly app: FastifyInstance) {
    this.repository = new MediaRepository(app);
  }

  private getExtension(contentType: CreateUploadIntentBody["contentType"]) {
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

  private buildObjectKey(userId: string, photoToken: string, extension: string) {
    return `users/${userId}/profile/original/${photoToken}.${extension}`;
  }

  private buildVariantKey(userId: string, photoToken: string, extension: string, variantName: string) {
    return `users/${userId}/profile/${variantName}/${photoToken}.${extension}`;
  }

  private buildCdnUrl(objectKey: string) {
    return `${this.app.config.CDN_BASE_URL!.replace(/\/$/, "")}/${objectKey}`;
  }

  private uploadRateKey(userId: string) {
    return `media:upload:${userId}`;
  }

  private async guardUploadRate(userId: string) {
    const key = this.uploadRateKey(userId);
    const count = await this.app.redis.incr(key);
    if (count === 1) {
      await this.app.redis.expire(key, 60 * 10);
    }
    if (count > 30) {
      throw new TooManyRequestsError("upload_rate_limit_exceeded");
    }
  }

  private validateUpload(body: CreateUploadIntentBody) {
    if (!acceptedMimeTypes.includes(body.contentType)) {
      throw new BadRequestError("unsupported_media_type");
    }

    if (body.sizeBytes > this.app.config.MEDIA_MAX_UPLOAD_SIZE_BYTES) {
      throw new BadRequestError("file_too_large", {
        maxUploadSizeBytes: this.app.config.MEDIA_MAX_UPLOAD_SIZE_BYTES
      });
    }

    const extension = path.extname(body.fileName).replace(".", "").toLowerCase();
    if (extension && !["jpg", "jpeg", "png", "webp"].includes(extension)) {
      throw new BadRequestError("invalid_file_extension");
    }
  }

  async createUploadIntent(userId: string, body: CreateUploadIntentBody) {
    this.validateUpload(body);
    await this.guardUploadRate(userId);

    const activePhotos = await this.repository.countActiveProfilePhotos(userId);
    if (activePhotos >= this.app.config.MEDIA_MAX_PROFILE_PHOTOS) {
      throw new BadRequestError("profile_photo_limit_reached", {
        maxProfilePhotos: this.app.config.MEDIA_MAX_PROFILE_PHOTOS
      });
    }

    const photoToken = randomUUID();
    const extension = this.getExtension(body.contentType);
    const objectKey = this.buildObjectKey(userId, photoToken, extension);
    const cdnUrl = this.buildCdnUrl(objectKey);

    const uploadUrl = await getSignedUrl(
      this.app.storage,
      new PutObjectCommand({
        Bucket: this.app.config.STORAGE_IMAGES_BUCKET!,
        Key: objectKey,
        ContentType: body.contentType,
        ContentLength: body.sizeBytes
      }),
      { expiresIn: 60 * 10 }
    );

    const photo = await this.repository.createPhotoRecord({
      userId,
      objectKey,
      cdnUrl,
      mimeType: body.contentType,
      fileSizeBytes: body.sizeBytes
    });

    return {
      photoId: photo.photoId,
      objectKey,
      uploadUrl,
      maxUploadSizeBytes: this.app.config.MEDIA_MAX_UPLOAD_SIZE_BYTES,
      acceptedMimeTypes: [...acceptedMimeTypes],
      storage: {
        bucket: this.app.config.STORAGE_IMAGES_BUCKET!,
        publicBaseUrl: this.app.config.CDN_BASE_URL!
      },
      moderationStatus: photo.moderationStatus
    };
  }

  async completeUpload(userId: string, body: CompleteUploadBody) {
    const photo = await this.repository.getOwnedPhoto(userId, body.photoId);
    const extension = photo.mimeType === "image/png" ? "png" : photo.mimeType === "image/webp" ? "webp" : "jpg";
    const token = path.basename(photo.storageKey, path.extname(photo.storageKey));

    const plannedVariants = variantDefinitions.map((variant) => {
      const storageKey =
        variant.variantName === "original"
          ? `users/${userId}/profile/original/${token}.${extension}`
          : this.buildVariantKey(userId, token, extension, variant.variantName);

      return {
        variantName: variant.variantName,
        storageKey,
        cdnUrl: this.buildCdnUrl(storageKey)
      };
    });

    const updatedPhoto = await this.repository.completeUpload({
      userId,
      photoId: body.photoId,
      width: body.width,
      height: body.height,
      fileSizeBytes: body.fileSizeBytes,
      plannedVariants
    });

    this.app.log.info(
      {
        event: "media.processing.queued",
        userId,
        photoId: updatedPhoto.photoId,
        variants: plannedVariants.map((variant) => variant.variantName)
      },
      "image compression and variant generation prepared"
    );

    return {
      photo: updatedPhoto,
      processing: {
        compressionQueued: true,
        variantsPlanned: variantDefinitions.map((variant) => variant.variantName)
      }
    };
  }

  listProfilePhotos(userId: string) {
    return this.repository.listProfilePhotos(userId).then((items) => ({ items }));
  }

  async setPrimaryPhoto(userId: string, photoId: string) {
    return {
      photo: await this.repository.setPrimaryPhoto(userId, photoId)
    };
  }

  async reorderPhotos(userId: string, orderedPhotoIds: string[]) {
    return {
      items: await this.repository.reorderPhotos(userId, orderedPhotoIds)
    };
  }

  deletePhoto(userId: string, photoId: string) {
    return this.repository.deletePhoto(userId, photoId);
  }
}
