import { z } from "zod";

export const circleWindowSchema = z.enum(["24h", "3d", "7d", "1m", "3m", "1y"]);

export const listEncountersQuerySchema = z.object({
  window: circleWindowSchema.default("24h"),
  lat: z.coerce.number().min(-90).max(90).default(52.52),
  lon: z.coerce.number().min(-180).max(180).default(13.405)
});

export const locationEventBodySchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  accuracyMeters: z.number().positive().max(25000).default(250)
});

export type CircleWindow = z.infer<typeof circleWindowSchema>;
export type ListEncountersQuery = z.infer<typeof listEncountersQuerySchema>;
export type LocationEventBody = z.infer<typeof locationEventBodySchema>;
