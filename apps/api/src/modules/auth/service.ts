import type { FastifyInstance } from "fastify";
import argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";
import { BadRequestError, ConflictError, UnauthorizedError } from "../../common/errors.js";
import { AuthRepository, type AuthUserRecord } from "./repository.js";
import type { AuthResponse } from "./schema.js";

export class AuthService {
  private readonly repository: AuthRepository;

  constructor(private readonly app: FastifyInstance) {
    this.repository = new AuthRepository(app);
  }

  private hashOpaqueToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private parseExpiryToDate(input: string) {
    const amount = Number.parseInt(input, 10);
    if (input.endsWith("d")) return new Date(Date.now() + amount * 24 * 60 * 60 * 1000);
    if (input.endsWith("h")) return new Date(Date.now() + amount * 60 * 60 * 1000);
    if (input.endsWith("m")) return new Date(Date.now() + amount * 60 * 1000);
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  private toAuthUser(user: AuthUserRecord) {
    return {
      id: user.id,
      email: user.email,
      status: user.status
    };
  }

  private async issueTokens(input: {
    user: AuthUserRecord;
    userAgent?: string;
    ipAddress?: string | null;
    existingSessionId?: string;
  }): Promise<AuthResponse["tokens"]> {
    const sessionId = input.existingSessionId ?? randomBytes(16).toString("hex");
    const accessToken = await this.app.jwt.sign(
      {
        sub: input.user.id,
        email: input.user.email,
        role: "user"
      },
      {
        expiresIn: this.app.config.JWT_EXPIRES_IN
      }
    );

    const refreshToken = await this.app.jwt.sign(
      {
        sub: input.user.id,
        email: input.user.email,
        session: sessionId
      },
      {
        expiresIn: this.app.config.JWT_REFRESH_EXPIRES_IN
      }
    );

    const refreshTokenHash = this.hashOpaqueToken(refreshToken);
    const refreshExpiresAt = this.parseExpiryToDate(this.app.config.JWT_REFRESH_EXPIRES_IN);

    if (input.existingSessionId) {
      await this.repository.rotateSession(input.existingSessionId, refreshTokenHash, refreshExpiresAt);
    } else {
      await this.repository.createSession({
        sessionId,
        userId: input.user.id,
        refreshTokenHash,
        expiresAt: refreshExpiresAt,
        userAgent: input.userAgent as string,
        ipAddress: input.ipAddress as string | null
      });
    }

    return {
      accessToken,
      refreshToken,
      expiresIn: this.app.config.JWT_EXPIRES_IN,
      refreshExpiresIn: this.app.config.JWT_REFRESH_EXPIRES_IN
    };
  }

  async register(email: string, password: string, meta?: { userAgent?: string; ipAddress?: string | null }): Promise<AuthResponse> {
    const existingUser = await this.repository.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictError("email_already_registered");
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1
    });

    const user = await this.repository.createUser(email, passwordHash);
    await this.repository.createVerificationRequest(user.id, {
      email,
      token: randomBytes(24).toString("hex"),
      purpose: "email_verification"
    });

    return {
      user: this.toAuthUser(user),
      tokens: await this.issueTokens({
        user,
        userAgent: meta?.userAgent as string,
        ipAddress: meta?.ipAddress as string | null
      })
    };
  }

  async login(email: string, password: string, meta?: { userAgent?: string; ipAddress?: string | null }): Promise<AuthResponse> {
    const user = await this.repository.findUserByEmail(email);
    if (!user?.passwordHash) {
      throw new UnauthorizedError("invalid_credentials");
    }

    const passwordValid = await argon2.verify(user.passwordHash, password);
    if (!passwordValid) {
      throw new UnauthorizedError("invalid_credentials");
    }

    return {
      user: this.toAuthUser(user),
      tokens: await this.issueTokens({
        user,
        userAgent: meta?.userAgent as string,
        ipAddress: meta?.ipAddress as string | null
      })
    };
  }

  async refresh(refreshToken: string, meta?: { userAgent?: string; ipAddress?: string | null }): Promise<AuthResponse> {
    const payload = await this.app.jwt.verify<{ sub: string; session: string }>(refreshToken);
    const refreshTokenHash = this.hashOpaqueToken(refreshToken);
    const session = await this.repository.findActiveSessionByTokenHash(refreshTokenHash);

    if (!session) {
      throw new UnauthorizedError("invalid_refresh_token");
    }

    const user = await this.repository.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedError("invalid_refresh_token");
    }

    return {
      user: this.toAuthUser(user),
      tokens: await this.issueTokens({
        user,
        userAgent: meta?.userAgent as string,
        ipAddress: meta?.ipAddress as string | null,
        existingSessionId: session.session_id
      })
    };
  }

  async logout(refreshToken: string) {
    const refreshTokenHash = this.hashOpaqueToken(refreshToken);
    await this.repository.revokeSessionByTokenHash(refreshTokenHash);
    return { message: "logged_out" };
  }

  async prepareForgotPassword(email: string) {
    const user = await this.repository.findUserByEmail(email);
    if (user) {
      await this.repository.createPasswordResetRequest(user.id, {
        email,
        token: randomBytes(24).toString("hex"),
        purpose: "password_reset"
      });
    }

    return { message: "password_reset_prepared" };
  }

  async prepareEmailVerification(email: string) {
    const user = await this.repository.findUserByEmail(email);
    if (user) {
      await this.repository.createVerificationRequest(user.id, {
        email,
        token: randomBytes(24).toString("hex"),
        purpose: "email_verification"
      });
    }

    return { message: "verification_prepared" };
  }

  async confirmEmailVerification(token: string) {
    if (token.length < 32) {
      throw new BadRequestError("invalid_verification_token");
    }

    return { message: "email_verification_confirm_prepared" };
  }

  async googleLogin(credential: string, meta?: { userAgent?: string; ipAddress?: string | null }): Promise<AuthResponse> {
    // Verify Google ID token
    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
    const response = await fetch(verifyUrl);

    if (!response.ok) {
      throw new UnauthorizedError("invalid_google_credential");
    }

    type GoogleTokenPayload = {
      sub: string;
      email: string;
      email_verified: string;
      aud: string;
    };

    const payload = (await response.json()) as GoogleTokenPayload;

    if (payload.aud !== this.app.config.GOOGLE_CLIENT_ID) {
      throw new UnauthorizedError("invalid_google_audience");
    }

    let user = await this.repository.findUserByGoogleSub(payload.sub);

    if (!user) {
      // Check if user exists by email and link Google account
      const existingUser = await this.repository.findUserByEmail(payload.email);
      if (existingUser) {
        await this.repository.linkGoogleAccount(existingUser.id, payload.sub);
        user = existingUser;
      } else {
        user = await this.repository.createGoogleUser(payload.email, payload.sub);
      }
    }

    const userRecord = await this.repository.findUserById(user.id);
    if (!userRecord) {
      throw new UnauthorizedError("user_not_found");
    }

    return {
      user: this.toAuthUser(userRecord),
      tokens: await this.issueTokens({
        user: userRecord,
        userAgent: meta?.userAgent as string,
        ipAddress: meta?.ipAddress as string | null
      })
    };
  }

  async resetPassword(token: string, newPassword: string) {
    if (token.length < 32) {
      throw new BadRequestError("invalid_reset_token");
    }

    // Verify the reset token exists and belongs to a user
    const resetRequest = await this.repository.findActiveResetRequest(token);
    if (!resetRequest) {
      throw new UnauthorizedError("invalid_or_expired_reset_token");
    }

    // Hash the new password
    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1
    });

    // Update the user's password
    await this.repository.updateUserPassword(resetRequest.userId, passwordHash);

    // Invalidate all existing sessions for this user
    await this.repository.revokeAllUserSessions(resetRequest.userId);

    // Mark the reset request as consumed
    await this.repository.consumeResetRequest(token);

    return { message: "password_reset_successful" };
  }
}
