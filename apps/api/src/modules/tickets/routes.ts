import type { FastifyInstance } from "fastify";
import { getTicket } from "./service.js";

export async function ticketRoutes(app: FastifyInstance) {
  app.get("/tickets/:id", async (request) => {
    const { id } = request.params as { id: string };
    return getTicket(id);
  });
}
