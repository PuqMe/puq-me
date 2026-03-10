import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const authModule: AppModule = {
  name: "auth",
  prefix: "/v1/auth",
  plugin: routes
};
