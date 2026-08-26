import type { FastifyInstance } from "fastify";
import { getUserId } from "../../lib/auth.js";
import {
  cancelReservation,
  confirmReservation,
  createReservation,
  getReservation,
} from "./service.js";
import { createReservationSchema, type CreateReservationBody } from "./schemas.js";

export async function reservationRoutes(app: FastifyInstance) {
  app.post(
    "/sessions/:sessionId/reservations",
    { schema: { body: createReservationSchema } },
    async (request, reply) => {
      const { sessionId } = request.params as { sessionId: string };
      const reservation = await createReservation(
        sessionId,
        getUserId(request),
        request.body as CreateReservationBody,
      );
      return reply.status(201).send(reservation);
    },
  );

  app.get("/reservations/:id", async (request) => {
    const { id } = request.params as { id: string };
    return getReservation(id);
  });

  app.delete("/reservations/:id", async (request) => {
    const { id } = request.params as { id: string };
    return cancelReservation(id, getUserId(request));
  });

  app.post("/reservations/:reservationId/confirm", async (request) => {
    const { reservationId } = request.params as { reservationId: string };
    return confirmReservation(reservationId, getUserId(request));
  });
}
