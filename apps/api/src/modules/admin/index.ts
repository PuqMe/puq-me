import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const adminModule: AppModule = {
  name: "admin",
  prefix: "/v1/admin",
  plugin: routes
};
