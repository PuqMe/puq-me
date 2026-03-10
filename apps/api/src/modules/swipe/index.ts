import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const swipeModule: AppModule = {
  name: "swipe",
  prefix: "/v1/swipe",
  plugin: routes
};
