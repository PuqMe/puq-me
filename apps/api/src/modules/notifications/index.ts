import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const notificationsModule: AppModule = {
  name: "notifications",
  prefix: "/v1/notifications",
  plugin: routes
};
