import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const mediaModule: AppModule = {
  name: "media",
  prefix: "",
  plugin: routes
};
