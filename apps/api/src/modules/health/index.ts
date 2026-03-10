import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const healthModule: AppModule = {
  name: "health",
  prefix: "/health",
  plugin: routes
};
