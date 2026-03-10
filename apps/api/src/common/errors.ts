export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
    public readonly code = "internal_error",
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "resource_not_found") {
    super(message, 404, "not_found");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "unauthorized") {
    super(message, 401, "unauthorized");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "forbidden") {
    super(message, 403, "forbidden");
  }
}

export class ConflictError extends AppError {
  constructor(message = "conflict", details?: unknown) {
    super(message, 409, "conflict", details);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "bad_request", details?: unknown) {
    super(message, 400, "bad_request", details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "too_many_requests", details?: unknown) {
    super(message, 429, "too_many_requests", details);
  }
}

export class ValidationError extends AppError {
  constructor(message = "validation_error", details?: unknown) {
    super(message, 422, "validation_error", details);
  }
}

export class PaymentRequiredError extends AppError {
  constructor(message = "payment_required", details?: unknown) {
    super(message, 402, "payment_required", details);
  }
}
