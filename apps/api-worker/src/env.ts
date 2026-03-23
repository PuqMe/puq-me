export type Env = {
  // D1 Database
  DB: D1Database;
  // KV Namespace (sessions, rate limits, cache)
  KV: KVNamespace;
  // Durable Objects
  CHAT_ROOM: DurableObjectNamespace;

  // Environment variables
  APP_ORIGIN: string;
  CDN_BASE_URL: string;
  GOOGLE_CLIENT_ID_WEB: string;

  // Secrets
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  S3_ENDPOINT: string;
  S3_REGION: string;
  S3_BUCKET: string;
  S3_ACCESS_KEY: string;
  S3_SECRET_KEY: string;
  GOOGLE_CLIENT_ID: string;
};

export type AppContext = {
  Bindings: Env;
  Variables: {
    userId: string;
    userEmail: string;
  };
};
