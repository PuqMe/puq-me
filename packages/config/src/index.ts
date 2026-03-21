import { envSchema } from "@puqme/validation";

export const BRAND_NAME = "PuQ.me" as const;
export const BRAND_SHORT_NAME = "PuQ" as const;
export const BRAND_TAGLINE = "Echte Begegnungen in deiner Stadt." as const;
export const BRAND_DESCRIPTION = "Entdecke Menschen in deiner N\u00e4he \u2014 standortbasiertes Dating mit Pr\u00e4senz, Matching und Chat." as const;
export const BRAND_ADMIN_DESCRIPTION = `Trust, moderation and growth operations for ${BRAND_NAME}.` as const;
export const BRAND_THEME_COLOR = "#A855F7" as const;
export const BRAND_SURFACE_COLOR = "#472845" as const;

export function loadBaseConfig(env: NodeJS.ProcessEnv = process.env) {
  return envSchema.parse(env);
}

export const appNames = {
  web: "@puqme/web",
  admin: "@puqme/admin",
  api: "@puqme/api",
  websocket: "@puqme/websocket"
} as const;
