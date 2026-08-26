import type { FastifyInstance } from "fastify";
import { listSessionSeats } from "./service.js";

export async function seatRoutes(app: FastifyInstance) {
  app.get("/sessions/:sessionId/seats", async (request) => {
    const { sessionId } = request.params as { sessionId: string };
    return listSessionSeats(sessionId);
  });
}
