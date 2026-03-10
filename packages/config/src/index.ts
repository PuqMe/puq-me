import { envSchema } from "@puqme/validation";

export function loadBaseConfig(env: NodeJS.ProcessEnv = process.env) {
  return envSchema.parse(env);
}

export const appNames = {
  web: "@puqme/web",
  admin: "@puqme/admin",
  api: "@puqme/api",
  websocket: "@puqme/websocket"
} as const;
