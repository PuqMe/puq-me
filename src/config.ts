import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  APP_ORIGIN: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("15m"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_PUBLIC_BASE_URL: z.string().url(),
  WEBSOCKET_PING_MS: z.coerce.number().int().positive().default(30000),
  WEBSOCKET_TYPING_TTL_SECONDS: z.coerce.number().int().positive().default(5),
  SWIPE_RATE_LIMIT: z.coerce.number().int().positive().default(120),
  MESSAGE_RATE_LIMIT: z.coerce.number().int().positive().default(60),
  UPLOAD_URL_TTL_SECONDS: z.coerce.number().int().positive().default(300)
});

export type AppConfig = z.infer<typeof envSchema>;

export type JwtUser = {
  sub: string;
  email?: string;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return envSchema.parse(env);
}
