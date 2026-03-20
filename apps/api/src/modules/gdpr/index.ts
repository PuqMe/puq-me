import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const gdprModule: AppModule = {
  name: "gdpr",
  prefix: "/v1/gdpr",
  plugin: routes
};
