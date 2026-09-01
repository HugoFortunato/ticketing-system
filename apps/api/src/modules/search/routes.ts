import type { FastifyInstance } from "fastify";
import { searchEvents } from "./service.js";

export async function searchRoutes(app: FastifyInstance) {
  app.get("/search", async (request, reply) => {
    const { q } = request.query as { q?: string };
    const { events, engine } = await searchEvents(q);
    return reply.header("X-Search-Engine", engine).send(events);
  });
}
