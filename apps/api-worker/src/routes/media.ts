import { Hono } from "hono";
import type { AppContext } from "../env.js";
import { auth } from "../middleware/auth.js";
import { createSignedUpload, deleteObject } from "../lib/storage.js";
import { BadRequestError, NotFoundError } from "../lib/errors.js";

const media = new Hono<AppContext>();

media.use("/upload/*", auth);
media.use("/v1/media/*", auth);

// POST /upload/avatar
media.post("/upload/avatar", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const result = await createSignedUpload(c.env, userId, "avatar", body);
  return c.json(result);
});

// POST /upload/image
media.post("/upload/image", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const result = await createSignedUpload(c.env, userId, "image", body);
  return c.json(result);
});

// POST /upload/chat-media
media.post("/upload/chat-media", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const result = await createSignedUpload(c.env, userId, "chat_media", body);
  return c.json(result);
});

// GET /v1/media/profile-photos
media.get("/v1/media/profile-photos", async (c) => {
  const userId = c.get("userId");

  const photos = await c.env.DB.prepare(`
    SELECT id, storage_key, cdn_url, mime_type, file_size_bytes, width, height,
           sort_order, is_primary, moderation_status, created_at, updated_at
    FROM profile_photos
    WHERE user_id = ? AND deleted_at IS NULL
    ORDER BY sort_order ASC
  `).bind(userId).all();

  return c.json({
    items: (photos.results ?? []).map((p: any) => ({
      id: String(p.id),
      storageKey: p.storage_key,
      cdnUrl: p.cdn_url,
      mimeType: p.mime_type,
      fileSizeBytes: p.file_size_bytes,
      width: p.width,
      height: p.height,
      sortOrder: p.sort_order,
      isPrimary: Boolean(p.is_primary),
      moderationStatus: p.moderation_status,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }))
  });
});

// POST /v1/media/profile-photos/upload-intent
media.post("/v1/media/profile-photos/upload-intent", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  // Check max photos
  const count = await c.env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM profile_photos WHERE user_id = ? AND deleted_at IS NULL`
  ).bind(userId).first<{ cnt: number }>();

  if ((count?.cnt ?? 0) >= 6) {
    throw new BadRequestError("max_photos_reached", { maxPhotos: 6 });
  }

  const result = await createSignedUpload(c.env, userId, "image", body);
  return c.json(result, 201);
});

// POST /v1/media/profile-photos/complete
media.post("/v1/media/profile-photos/complete", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  // Get next sort order
  const maxSort = await c.env.DB.prepare(
    `SELECT MAX(sort_order) as max_sort FROM profile_photos WHERE user_id = ? AND deleted_at IS NULL`
  ).bind(userId).first<{ max_sort: number | null }>();

  const sortOrder = (maxSort?.max_sort ?? -1) + 1;

  // Check if this is the first photo (make it primary)
  const existingCount = await c.env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM profile_photos WHERE user_id = ? AND deleted_at IS NULL`
  ).bind(userId).first<{ cnt: number }>();

  const isPrimary = (existingCount?.cnt ?? 0) === 0 ? 1 : 0;

  const cdnBaseUrl = c.env.CDN_BASE_URL.replace(/\/$/, "");

  const result = await c.env.DB.prepare(`
    INSERT INTO profile_photos (user_id, storage_key, cdn_url, mime_type, file_size_bytes, width, height, sort_order, is_primary, moderation_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    RETURNING id, storage_key, cdn_url, sort_order, is_primary, moderation_status, created_at
  `).bind(
    userId,
    body.storageKey,
    `${cdnBaseUrl}/${body.storageKey}`,
    body.contentType ?? null,
    body.sizeBytes ?? null,
    body.width ?? null,
    body.height ?? null,
    sortOrder,
    isPrimary
  ).first();

  return c.json({
    photo: {
      id: String(result!.id),
      storageKey: result!.storage_key,
      cdnUrl: result!.cdn_url,
      sortOrder: result!.sort_order,
      isPrimary: Boolean(result!.is_primary),
      moderationStatus: result!.moderation_status,
      createdAt: result!.created_at
    }
  }, 201);
});

// POST /v1/media/profile-photos/primary
media.post("/v1/media/profile-photos/primary", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE profile_photos SET is_primary = 0, updated_at = datetime('now') WHERE user_id = ? AND is_primary = 1 AND deleted_at IS NULL`
    ).bind(userId),
    c.env.DB.prepare(
      `UPDATE profile_photos SET is_primary = 1, updated_at = datetime('now') WHERE id = ? AND user_id = ? AND deleted_at IS NULL`
    ).bind(body.photoId, userId)
  ]);

  return c.json({ message: "primary_photo_updated" });
});

// POST /v1/media/profile-photos/reorder
media.post("/v1/media/profile-photos/reorder", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const statements = (body.orderedPhotoIds as string[]).map((photoId: string, index: number) =>
    c.env.DB.prepare(
      `UPDATE profile_photos SET sort_order = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ? AND deleted_at IS NULL`
    ).bind(index, photoId, userId)
  );

  if (statements.length > 0) {
    await c.env.DB.batch(statements);
  }

  return c.json({ message: "photos_reordered" });
});

// DELETE /v1/media/profile-photos/:photoId
media.delete("/v1/media/profile-photos/:photoId", async (c) => {
  const userId = c.get("userId");
  const photoId = c.req.param("photoId");

  const photo = await c.env.DB.prepare(
    `SELECT id, storage_key, is_primary FROM profile_photos WHERE id = ? AND user_id = ? AND deleted_at IS NULL LIMIT 1`
  ).bind(photoId, userId).first<{ id: number; storage_key: string; is_primary: number }>();

  if (!photo) {
    throw new NotFoundError("photo_not_found");
  }

  // Soft delete
  await c.env.DB.prepare(
    `UPDATE profile_photos SET deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
  ).bind(photoId).run();

  // If this was primary, promote next photo
  if (photo.is_primary) {
    await c.env.DB.prepare(
      `UPDATE profile_photos SET is_primary = 1, updated_at = datetime('now') WHERE user_id = ? AND deleted_at IS NULL AND is_primary = 0 ORDER BY sort_order ASC LIMIT 1`
    ).bind(userId).run();
  }

  // Delete from S3 in background
  c.executionCtx.waitUntil(deleteObject(c.env, photo.storage_key).catch(() => {}));

  return c.json({ message: "photo_deleted" });
});

export default media;
