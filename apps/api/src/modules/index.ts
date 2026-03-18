import type { AppModule } from "../common/module.js";
import { adminModule } from "./admin/index.js";
import { analyticsModule } from "./analytics/index.js";
import { authModule } from "./auth/index.js";
import { billingModule } from "./billing/index.js";
import { chatModule } from "./chat/index.js";
import { circleModule } from "./circle/index.js";
import { experimentsModule } from "./experiments/index.js";
import { healthModule } from "./health/index.js";
import { matchModule } from "./match/index.js";
import { mediaModule } from "./media/index.js";
import { moderationModule } from "./moderation/index.js";
import { notificationsModule } from "./notifications/index.js";
import { profilesModule } from "./profiles/index.js";
import { swipeModule } from "./swipe/index.js";
import { usersModule } from "./users/index.js";

export const modules: AppModule[] = [
  healthModule,
  circleModule,
  analyticsModule,
  authModule,
  billingModule,
  experimentsModule,
  usersModule,
  profilesModule,
  mediaModule,
  swipeModule,
  matchModule,
  chatModule,
  notificationsModule,
  moderationModule,
  adminModule
];
