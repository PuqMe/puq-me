import { z } from "zod";

export const genderEnum = z.enum([
  "man",
  "woman",
  "non_binary",
  "agender",
  "other",
  "prefer_not_to_say"
]);

export const datingIntentEnum = z.enum(["serious", "casual", "friends", "open"]);

export const interestedInEnum = z.enum([
  "men",
  "women",
  "non_binary",
  "everyone"
]);

export const updateProfileBodySchema = z
  .object({
    displayName: z.string().min(2).max(80).optional(),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    bio: z.string().max(500).optional(),
    gender: genderEnum.optional(),
    datingIntent: datingIntentEnum.optional(),
    occupation: z.string().max(120).optional(),
    city: z.string().max(120).optional(),
    countryCode: z.string().length(2).optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one profile field must be provided."
  });

export const updateInterestsBodySchema = z
  .object({
    interests: z.array(z.string().min(1).max(50)).min(1).max(15)
  })
  .strict();

export const updateVisibilityBodySchema = z
  .object({
    isVisible: z.boolean()
  })
  .strict();

export const updatePreferencesBodySchema = z
  .object({
    interestedIn: z.array(interestedInEnum).min(1).max(4),
    minAge: z.number().int().min(18).max(99),
    maxAge: z.number().int().min(18).max(99),
    maxDistanceKm: z.number().int().min(1).max(500),
    showMeGlobally: z.boolean().optional(),
    onlyVerifiedProfiles: z.boolean().optional()
  })
  .strict()
  .refine((value) => value.minAge <= value.maxAge, {
    message: "Minimum age must be less than or equal to maximum age.",
    path: ["minAge"]
  });

export const updateLocationBodySchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    city: z.string().max(120).optional(),
    countryCode: z.string().length(2).optional()
  })
  .strict();

export const profileResponseSchema = z.object({
  userId: z.string(),
  profile: z.object({
    displayName: z.string(),
    birthDate: z.string(),
    bio: z.string().nullable(),
    gender: z.string().nullable(),
    datingIntent: z.string().nullable(),
    occupation: z.string().nullable(),
    city: z.string().nullable(),
    countryCode: z.string().nullable(),
    isVisible: z.boolean()
  }),
  interests: z.array(z.string()),
  preferences: z.object({
    interestedIn: z.array(z.string()),
    minAge: z.number(),
    maxAge: z.number(),
    maxDistanceKm: z.number(),
    showMeGlobally: z.boolean(),
    onlyVerifiedProfiles: z.boolean()
  }),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      city: z.string().nullable(),
      countryCode: z.string().nullable()
    })
    .nullable()
});

export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
export type UpdateInterestsBody = z.infer<typeof updateInterestsBodySchema>;
export type UpdateVisibilityBody = z.infer<typeof updateVisibilityBodySchema>;
export type UpdatePreferencesBody = z.infer<typeof updatePreferencesBodySchema>;
export type UpdateLocationBody = z.infer<typeof updateLocationBodySchema>;
