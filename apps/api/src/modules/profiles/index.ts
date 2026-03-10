import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const profilesModule: AppModule = {
  name: "profiles",
  prefix: "/v1/profiles",
  plugin: routes
};
