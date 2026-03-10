import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000)
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10)
});

export type RegisterInput = z.infer<typeof registerSchema>;
