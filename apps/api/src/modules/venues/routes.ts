import type { FastifyInstance } from "fastify";
import { getVenue, listVenues } from "./service.js";

export async function venueRoutes(app: FastifyInstance) {
  app.get("/venues", async () => listVenues());

  app.get("/venues/:id", async (request) => {
    const { id } = request.params as { id: string };
    return getVenue(id);
  });
}
