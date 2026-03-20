/**
 * Environment configuration with lazy evaluation.
 * Uses getters to defer process.env access until actual usage,
 * which prevents crashes during Worker module initialization
 * in Cloudflare's edge runtime.
 */
export const env = {
  get appUrl() {
    return process.env.NEXT_PUBLIC_APP_URL ?? "https://puq.me";
  },
  get apiBaseUrl() {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.puq.me";
  },
  get websocketBaseUrl() {
    return process.env.NEXT_PUBLIC_WS_BASE_URL ?? "wss://ws.puq.me";
  },
  get googleClientId() {
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  },
  get appEnv() {
    return process.env.NEXT_PUBLIC_APP_ENV ?? "production";
  },
};
