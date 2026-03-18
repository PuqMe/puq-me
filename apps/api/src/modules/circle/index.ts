import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const circleModule: AppModule = {
  name: "circle",
  prefix: "/v1/circle",
  plugin: routes
};
