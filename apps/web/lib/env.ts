export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
  websocketBaseUrl: process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://localhost:3010",
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "development"
};
