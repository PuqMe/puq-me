import { ZodError } from "zod";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "./errors.js";

export function handleRouteError(error: unknown, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof ZodError) {
    request.log.warn({ error }, "validation failed");
    return reply.code(400).send({
      error: "validation_error",
      details: error.flatten()
    });
  }

  if (error instanceof AppError) {
    request.log.warn({ error }, "application error");
    return reply.code(error.statusCode).send({
      error: error.code,
      message: error.message,
      details: error.details
    });
  }

  request.log.error({ error }, "unexpected error");
  return reply.code(500).send({
    error: "internal_error",
    message: "Unexpected server error."
  });
}
