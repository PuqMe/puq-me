import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const matchModule: AppModule = {
  name: "match",
  prefix: "/v1/matches",
  plugin: routes
};
