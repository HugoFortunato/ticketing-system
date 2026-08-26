import type { FastifyInstance } from "fastify";
import { getSession } from "./service.js";

export async function sessionRoutes(app: FastifyInstance) {
  app.get("/sessions/:id", async (request) => {
    const { id } = request.params as { id: string };
    return getSession(id);
  });
}
