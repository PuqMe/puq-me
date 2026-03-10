import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const billingModule: AppModule = {
  name: "billing",
  prefix: "/v1/billing",
  plugin: routes
};
