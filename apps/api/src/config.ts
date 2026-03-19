import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

const apiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DEV_MOCK_MODE: z.coerce.boolean().default(false),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  APP_ORIGIN: z.string().default("http://localhost:3001"),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  S3_ENDPOINT: z.string().min(1),
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_PUBLIC_BASE_URL: z.string().min(1),
  CDN_BASE_URL: z.string().min(1).optional(),
  STORAGE_AVATARS_BUCKET: z.string().min(1).optional(),
  STORAGE_IMAGES_BUCKET: z.string().min(1).optional(),
  STORAGE_CHAT_MEDIA_BUCKET: z.string().min(1).optional(),
  STORAGE_BACKUPS_BUCKET: z.string().min(1).optional(),
  MEDIA_MAX_UPLOAD_SIZE_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  MEDIA_MAX_PROFILE_PHOTOS: z.coerce.number().int().positive().default(6),
  UPLOAD_AVATAR_MAX_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
  UPLOAD_IMAGE_MAX_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  UPLOAD_CHAT_MEDIA_MAX_BYTES: z.coerce.number().int().positive().default(25 * 1024 * 1024),
  MALWARE_SCAN_HOOK_URL: z.string().url().optional(),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(250),
  RATE_LIMIT_WINDOW: z.string().default("1 minute"),
  AUTH_LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  AUTH_LOGIN_RATE_LIMIT_WINDOW: z.string().default("15 minutes"),
  EXPERIMENT_SALT: z.string().min(16).default("replace-with-a-stable-experiment-salt"),
  GOOGLE_CLIENT_ID: z.string().min(1)
});

export type ApiConfig = z.infer<typeof apiEnvSchema>;

let envLoaded = false;

function loadDotenvFiles() {
  if (envLoaded) {
    return;
  }

  const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "apps/api/.env")
  ];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath, override: false });
    }
  }

  envLoaded = true;
}

export function loadApiConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  loadDotenvFiles();

  const parsed = apiEnvSchema.parse(env);

  return {
    ...parsed,
    CDN_BASE_URL: parsed.CDN_BASE_URL ?? parsed.S3_PUBLIC_BASE_URL,
    STORAGE_AVATARS_BUCKET: parsed.STORAGE_AVATARS_BUCKET ?? parsed.S3_BUCKET,
    STORAGE_IMAGES_BUCKET: parsed.STORAGE_IMAGES_BUCKET ?? parsed.S3_BUCKET,
    STORAGE_CHAT_MEDIA_BUCKET: parsed.STORAGE_CHAT_MEDIA_BUCKET ?? parsed.S3_BUCKET,
    STORAGE_BACKUPS_BUCKET: parsed.STORAGE_BACKUPS_BUCKET ?? parsed.S3_BUCKET
  };
}
