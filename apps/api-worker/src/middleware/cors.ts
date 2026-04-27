import { cors } from "hono/cors";

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
    // `Cookie` is automatically sent on cross-origin requests when the client
    // uses `credentials: "include"`; it does not need to be in allowHeaders.
    // We list the headers our clients actually send.
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
    credentials: true
  });
}
