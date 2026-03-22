import { cors } from "hono/cors";
import type { AppContext } from "../env.js";

export function createCors() {
  return cors({
    origin: (origin) => {
      // Allow puq.me and its subdomains, plus localhost for dev
      if (
        origin === "https://puq.me" ||
        origin === "https://www.puq.me" ||
        origin?.endsWith(".puq.me") ||
        origin?.startsWith("http://localhost:")
      ) {
        return origin;
      }
      return "";
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
    credentials: true
  });
}
