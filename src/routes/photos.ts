import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { createPhotoUploadUrl } from "../lib/uploads.js";

const uploadIntentSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  category: z.enum(["profile", "chat"]).default("profile")
});

const photoRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.authenticate);

  app.post("/upload-intent", async (request, reply) => {
    const payload = uploadIntentSchema.parse(request.body);
    const upload = await createPhotoUploadUrl(app, request.user.sub, payload.contentType);

    if (payload.category === "profile") {
      await app.db.query(
        `insert into photos (user_id, storage_key, sort_order, moderation_status)
         values ($1, $2, 0, 'pending')
         on conflict do nothing`,
        [request.user.sub, upload.objectKey]
      );
    }

    return reply.code(201).send(upload);
  });
};

export default photoRoutes;
