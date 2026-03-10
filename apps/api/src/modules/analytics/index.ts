import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const analyticsModule: AppModule = {
  name: "analytics",
  prefix: "/v1/analytics",
  plugin: routes
};
