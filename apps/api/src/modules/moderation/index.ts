import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const moderationModule: AppModule = {
  name: "moderation",
  prefix: "/v1/moderation",
  plugin: routes
};
