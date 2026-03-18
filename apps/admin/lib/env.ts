export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002",
  adminAppUrl: process.env.NEXT_PUBLIC_ADMIN_APP_URL ?? "http://localhost:3002",
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "development"
} as const;
