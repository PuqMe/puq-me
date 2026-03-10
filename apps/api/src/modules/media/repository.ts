import type { FastifyInstance } from "fastify";
import { BadRequestError, NotFoundError } from "../../common/errors.js";

type PhotoRow = {
  photo_id: string;
  storage_key: string;
  sort_order: number;
  is_primary: boolean;
  moderation_status: "pending" | "approved" | "rejected";
  width: number | null;
  height: number | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  created_at: string;
  public_url: string | null;
};

type VariantRow = {
  photo_id: string;
  variant_name: "original" | "thumb" | "512w" | "1024w";
  width: number | null;
  height: number | null;
  public_url: string | null;
};

export class MediaRepository {
  constructor(private readonly app: FastifyInstance) {}

  private async loadVariants(photoIds: string[]) {
    if (photoIds.length === 0) {
      return new Map<string, VariantRow[]>();
    }

    const result = await this.app.db.query<VariantRow>(
      `select
         photo_id::text,
         variant_name,
         width,
         height,
         case
           when pp.moderation_status = 'approved' then pv.cdn_url
           else null
         end as public_url
       from profile_photo_variants pv
       join profile_photos pp on pp.id = pv.photo_id
       where pv.photo_id = any($1::bigint[])
       order by pv.variant_name asc`,
      [photoIds]
    );

    const byPhoto = new Map<string, VariantRow[]>();
    for (const row of result.rows) {
      const current = byPhoto.get(row.photo_id) ?? [];
      current.push(row);
      byPhoto.set(row.photo_id, current);
    }
    return byPhoto;
  }

  private async mapPhotos(rows: PhotoRow[]) {
    const variantsByPhoto = await this.loadVariants(rows.map((row) => row.photo_id));

    return rows.map((row) => ({
      photoId: row.photo_id,
      storageKey: row.storage_key,
      sortOrder: Number(row.sort_order),
      isPrimary: row.is_primary,
      moderationStatus: row.moderation_status,
      width: row.width,
      height: row.height,
      mimeType: row.mime_type,
      fileSizeBytes: row.file_size_bytes ? Number(row.file_size_bytes) : null,
      uploadedAt: row.created_at,
      publicUrl: row.public_url,
      variants: (variantsByPhoto.get(row.photo_id) ?? []).map((variant) => ({
        variantName: variant.variant_name,
        width: variant.width,
        height: variant.height,
        url: variant.public_url
      }))
    }));
  }

  async countActiveProfilePhotos(userId: string) {
    const result = await this.app.db.query<{ count: string }>(
      `select count(*)::text as count
       from profile_photos
       where user_id = $1::bigint
         and deleted_at is null`,
      [userId]
    );

    return Number(result.rows[0]?.count ?? 0);
  }

  async createPhotoRecord(input: {
    userId: string;
    objectKey: string;
    cdnUrl: string;
    mimeType: string;
    fileSizeBytes: number;
  }) {
    const result = await this.app.db.query<PhotoRow>(
      `with next_position as (
         select coalesce(max(sort_order), -1) + 1 as sort_order,
                count(*) = 0 as should_be_primary
         from profile_photos
         where user_id = $1::bigint
           and deleted_at is null
       )
       insert into profile_photos (
         user_id,
         storage_key,
         cdn_url,
         mime_type,
         file_size_bytes,
         sort_order,
         is_primary,
         moderation_status,
         created_at,
         updated_at
       )
       values (
         $1::bigint,
         $2,
         $3,
         $4,
         $5,
         (select sort_order from next_position),
         (select should_be_primary from next_position),
         'pending',
         now(),
         now()
       )
       returning
         id::text as photo_id,
         storage_key,
         sort_order,
         is_primary,
         moderation_status,
         width,
         height,
         mime_type,
         file_size_bytes,
         created_at::text,
         null::text as public_url`,
      [input.userId, input.objectKey, input.cdnUrl, input.mimeType, input.fileSizeBytes]
    );

    const [photo] = await this.mapPhotos(result.rows);
    return photo;
  }

  async listProfilePhotos(userId: string) {
    const result = await this.app.db.query<PhotoRow>(
      `select
         id::text as photo_id,
         storage_key,
         sort_order,
         is_primary,
         moderation_status,
         width,
         height,
         mime_type,
         file_size_bytes,
         created_at::text,
         case
           when moderation_status = 'approved' then cdn_url
           else null
         end as public_url
       from profile_photos
       where user_id = $1::bigint
         and deleted_at is null
       order by sort_order asc, created_at asc`,
      [userId]
    );

    return this.mapPhotos(result.rows);
  }

  async getOwnedPhoto(userId: string, photoId: string) {
    const result = await this.app.db.query<PhotoRow>(
      `select
         id::text as photo_id,
         storage_key,
         sort_order,
         is_primary,
         moderation_status,
         width,
         height,
         mime_type,
         file_size_bytes,
         created_at::text,
         case
           when moderation_status = 'approved' then cdn_url
           else null
         end as public_url
       from profile_photos
       where id = $1::bigint
         and user_id = $2::bigint
         and deleted_at is null
       limit 1`,
      [photoId, userId]
    );

    const [photo] = await this.mapPhotos(result.rows);
    if (!photo) {
      throw new NotFoundError("photo_not_found");
    }
    return photo;
  }

  async completeUpload(input: {
    userId: string;
    photoId: string;
    width?: number;
    height?: number;
    fileSizeBytes?: number;
    plannedVariants: Array<{ variantName: "original" | "thumb" | "512w" | "1024w"; storageKey: string; cdnUrl: string }>;
  }) {
    const result = await this.app.db.query<PhotoRow>(
      `update profile_photos
       set width = coalesce($3, width),
           height = coalesce($4, height),
           file_size_bytes = coalesce($5, file_size_bytes),
           updated_at = now()
       where id = $1::bigint
         and user_id = $2::bigint
         and deleted_at is null
       returning
         id::text as photo_id,
         storage_key,
         sort_order,
         is_primary,
         moderation_status,
         width,
         height,
         mime_type,
         file_size_bytes,
         created_at::text,
         case
           when moderation_status = 'approved' then cdn_url
           else null
         end as public_url`,
      [input.photoId, input.userId, input.width ?? null, input.height ?? null, input.fileSizeBytes ?? null]
    );

    if (!result.rows[0]) {
      throw new NotFoundError("photo_not_found");
    }

    for (const variant of input.plannedVariants) {
      await this.app.db.query(
        `insert into profile_photo_variants (
           photo_id,
           variant_name,
           storage_key,
           cdn_url,
           created_at
         )
         values ($1::bigint, $2, $3, $4, now())
         on conflict (photo_id, variant_name)
         do update set
           storage_key = excluded.storage_key,
           cdn_url = excluded.cdn_url`,
        [input.photoId, variant.variantName, variant.storageKey, variant.cdnUrl]
      );
    }

    return this.getOwnedPhoto(input.userId, input.photoId);
  }

  async setPrimaryPhoto(userId: string, photoId: string) {
    await this.getOwnedPhoto(userId, photoId);

    const client = await this.app.db.connect();
    try {
      await client.query("begin");
      await client.query(
        `update profile_photos
         set is_primary = false,
             updated_at = now()
         where user_id = $1::bigint
           and deleted_at is null`,
        [userId]
      );

      await client.query(
        `update profile_photos
         set is_primary = true,
             updated_at = now()
         where id = $1::bigint
           and user_id = $2::bigint
           and deleted_at is null`,
        [photoId, userId]
      );

      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }

    return this.getOwnedPhoto(userId, photoId);
  }

  async reorderPhotos(userId: string, orderedPhotoIds: string[]) {
    const photos = await this.listProfilePhotos(userId);
    const existingIds = photos.map((photo) => photo.photoId);

    if (existingIds.length !== orderedPhotoIds.length || existingIds.some((id) => !orderedPhotoIds.includes(id))) {
      throw new BadRequestError("invalid_photo_order");
    }

    const client = await this.app.db.connect();
    try {
      await client.query("begin");
      for (const [index, photoId] of orderedPhotoIds.entries()) {
        await client.query(
          `update profile_photos
           set sort_order = $3,
               updated_at = now()
           where id = $1::bigint
             and user_id = $2::bigint
             and deleted_at is null`,
          [photoId, userId, index]
        );
      }
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }

    return this.listProfilePhotos(userId);
  }

  async deletePhoto(userId: string, photoId: string) {
    const photo = await this.getOwnedPhoto(userId, photoId);

    await this.app.db.query(
      `update profile_photos
       set deleted_at = now(),
           is_primary = false,
           updated_at = now()
       where id = $1::bigint
         and user_id = $2::bigint
         and deleted_at is null`,
      [photoId, userId]
    );

    if (photo.isPrimary) {
      await this.app.db.query(
        `with next_photo as (
           select id
           from profile_photos
           where user_id = $1::bigint
             and deleted_at is null
           order by sort_order asc, created_at asc
           limit 1
         )
         update profile_photos
         set is_primary = true,
             updated_at = now()
         where id = (select id from next_photo)`,
        [userId]
      );
    }

    return {
      deleted: true,
      photoId
    };
  }
}
