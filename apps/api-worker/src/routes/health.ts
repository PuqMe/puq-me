import { Hono } from "hono";
import type { AppContext } from "../env.js";

const health = new Hono<AppContext>();

health.get("/", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    runtime: "cloudflare-workers"
  });
});

export default health;
