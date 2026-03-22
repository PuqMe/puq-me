import { HTTPException } from "hono/http-exception";

export class AppError extends HTTPException {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(statusCode as any, { message });
    this.code = code;
    this.details = details;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ? { details: this.details } : {})
      }
    };
  }
}

export class BadRequestError extends AppError {
  constructor(message = "bad_request", details?: unknown) {
    super(400, "bad_request", message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "unauthorized") {
    super(401, "unauthorized", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "forbidden") {
    super(403, "forbidden", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "resource_not_found") {
    super(404, "not_found", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "conflict", details?: unknown) {
    super(409, "conflict", message, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "too_many_requests", details?: unknown) {
    super(429, "too_many_requests", message, details);
  }
}
