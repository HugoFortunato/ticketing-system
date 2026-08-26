import type { FastifyError, FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";
import { AppError } from "../lib/errors.js";

function isValidationError(error: unknown): error is FastifyError {
  return (
    typeof error === "object" &&
    error !== null &&
    "validation" in error &&
    Boolean((error as FastifyError).validation)
  );
}

export function setupErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: unknown, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.code,
        message: error.message,
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return reply.status(409).send({
        error: "CONFLICT",
        message: "Um ou mais assentos já não estão disponíveis",
      });
    }

    if (isValidationError(error)) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: error.message,
      });
    }

    request.log.error(
      {
        err: error,
        method: request.method,
        url: request.url,
      },
      "unhandled error",
    );

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
    });
  });
}
