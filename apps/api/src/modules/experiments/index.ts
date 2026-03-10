import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const experimentsModule: AppModule = {
  name: "experiments",
  prefix: "/v1/experiments",
  plugin: routes
};
