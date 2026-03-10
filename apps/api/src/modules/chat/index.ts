import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const chatModule: AppModule = {
  name: "chat",
  prefix: "/v1/chat",
  plugin: routes
};
