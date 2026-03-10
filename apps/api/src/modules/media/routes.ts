import type { FastifyPluginAsync } from "fastify";
import {
  completeUploadBodySchema,
  createUploadIntentBodySchema,
  genericUploadIntentBodySchema,
  photoIdParamsSchema,
  reorderPhotosBodySchema,
  setPrimaryPhotoBodySchema
} from "./schema.js";
import { MediaService } from "./service.js";
import { StorageService } from "./storage.service.js";

const routes: FastifyPluginAsync = async (app) => {
  const service = new MediaService(app);
  const storageService = new StorageService(app);

  app.post("/upload/avatar", { preHandler: [app.authenticate] }, async (request) => {
    const payload = genericUploadIntentBodySchema.parse(request.body);
    return storageService.createSignedUpload(request.user?.sub ?? "anonymous", "avatar", payload);
  });

  app.post("/upload/image", { preHandler: [app.authenticate] }, async (request) => {
    const payload = genericUploadIntentBodySchema.parse(request.body);
    return storageService.createSignedUpload(request.user?.sub ?? "anonymous", "image", payload);
  });

  app.post("/upload/chat-media", { preHandler: [app.authenticate] }, async (request) => {
    const payload = genericUploadIntentBodySchema.parse(request.body);
    return storageService.createSignedUpload(request.user?.sub ?? "anonymous", "chat_media", payload);
  });

  app.get("/v1/media/profile-photos", { preHandler: [app.authenticate] }, async (request) => {
    return service.listProfilePhotos(request.user?.sub ?? "anonymous");
  });

  app.post("/v1/media/profile-photos/upload-intent", { preHandler: [app.authenticate] }, async (request) => {
    const payload = createUploadIntentBodySchema.parse(request.body);
    return service.createUploadIntent(request.user?.sub ?? "anonymous", payload);
  });

  app.post("/v1/media/profile-photos/complete", { preHandler: [app.authenticate] }, async (request) => {
    const payload = completeUploadBodySchema.parse(request.body);
    return service.completeUpload(request.user?.sub ?? "anonymous", payload);
  });

  app.post("/v1/media/profile-photos/primary", { preHandler: [app.authenticate] }, async (request) => {
    const payload = setPrimaryPhotoBodySchema.parse(request.body);
    return service.setPrimaryPhoto(request.user?.sub ?? "anonymous", payload.photoId);
  });

  app.post("/v1/media/profile-photos/reorder", { preHandler: [app.authenticate] }, async (request) => {
    const payload = reorderPhotosBodySchema.parse(request.body);
    return service.reorderPhotos(request.user?.sub ?? "anonymous", payload.orderedPhotoIds);
  });

  app.delete("/v1/media/profile-photos/:photoId", { preHandler: [app.authenticate] }, async (request) => {
    const params = photoIdParamsSchema.parse(request.params);
    return service.deletePhoto(request.user?.sub ?? "anonymous", params.photoId);
  });
};

export default routes;
