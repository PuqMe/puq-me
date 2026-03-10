import { z } from "zod";

const securePasswordSchema = z
  .string()
  .min(10)
  .max(128)
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a symbol");

export const registerBodySchema = z.object({
  email: z.string().email(),
  password: securePasswordSchema
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(128)
});

export const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(20)
});

export const logoutBodySchema = z.object({
  refreshToken: z.string().min(20)
});

export const forgotPasswordBodySchema = z.object({
  email: z.string().email()
});

export const emailVerificationRequestBodySchema = z.object({
  email: z.string().email()
});

export const emailVerificationConfirmBodySchema = z.object({
  token: z.string().min(32)
});

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  status: z.string()
});

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string(),
  refreshExpiresIn: z.string()
});

export const authResponseSchema = z.object({
  user: authUserSchema,
  tokens: authTokensSchema
});

export const messageResponseSchema = z.object({
  message: z.string()
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type RefreshTokenBody = z.infer<typeof refreshTokenBodySchema>;
export type LogoutBody = z.infer<typeof logoutBodySchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;
export type EmailVerificationRequestBody = z.infer<typeof emailVerificationRequestBodySchema>;
export type EmailVerificationConfirmBody = z.infer<typeof emailVerificationConfirmBodySchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
