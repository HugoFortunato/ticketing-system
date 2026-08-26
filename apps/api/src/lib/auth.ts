import type { FastifyRequest } from "fastify";
import { UnauthorizedError } from "./errors.js";

export function getUserId(request: FastifyRequest): string {
  const header = request.headers["x-user-id"];
  const userId = Array.isArray(header) ? header[0] : header;
  if (!userId) {
    throw new UnauthorizedError("Header x-user-id é obrigatório");
  }
  return userId;
}
