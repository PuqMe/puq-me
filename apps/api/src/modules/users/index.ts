import type { AppModule } from "../../common/module.js";
import routes from "./routes.js";

export const usersModule: AppModule = {
  name: "users",
  prefix: "/v1/users",
  plugin: routes
};
