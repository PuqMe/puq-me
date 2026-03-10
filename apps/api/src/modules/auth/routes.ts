import type { FastifyPluginAsync } from "fastify";
import {
  emailVerificationConfirmBodySchema,
  emailVerificationRequestBodySchema,
  forgotPasswordBodySchema,
  loginBodySchema,
  logoutBodySchema,
  refreshTokenBodySchema,
  registerBodySchema
} from "./schema.js";
import { AuthService } from "./service.js";

const routes: FastifyPluginAsync = async (app) => {
  const service = new AuthService(app);

  app.post("/register", async (request, reply) => {
    const payload = registerBodySchema.parse(request.body);
    const result = await service.register(payload.email, payload.password, {
      userAgent: request.headers["user-agent"],
      ipAddress: request.ip
    });
    return reply.code(201).send(result);
  });

  app.post(
    "/login",
    {
      config: {
        rateLimit: {
          max: app.config.AUTH_LOGIN_RATE_LIMIT_MAX,
          timeWindow: app.config.AUTH_LOGIN_RATE_LIMIT_WINDOW
        }
      }
    },
    async (request) => {
      const payload = loginBodySchema.parse(request.body);
      return service.login(payload.email, payload.password, {
        userAgent: request.headers["user-agent"],
        ipAddress: request.ip
      });
    }
  );

  app.post("/refresh", async (request) => {
    const payload = refreshTokenBodySchema.parse(request.body);
    return service.refresh(payload.refreshToken, {
      userAgent: request.headers["user-agent"],
      ipAddress: request.ip
    });
  });

  app.post("/logout", async (request) => {
    const payload = logoutBodySchema.parse(request.body);
    return service.logout(payload.refreshToken);
  });

  app.post("/forgot-password", async (request) => {
    const payload = forgotPasswordBodySchema.parse(request.body);
    return service.prepareForgotPassword(payload.email);
  });

  app.post("/email-verification/request", async (request) => {
    const payload = emailVerificationRequestBodySchema.parse(request.body);
    return service.prepareEmailVerification(payload.email);
  });

  app.post("/email-verification/confirm", async (request) => {
    const payload = emailVerificationConfirmBodySchema.parse(request.body);
    return service.confirmEmailVerification(payload.token);
  });
};

export default routes;
