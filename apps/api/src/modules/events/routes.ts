import type { FastifyInstance } from "fastify";
import {
  createEvent,
  createSession,
  deleteEvent,
  getEvent,
  listEvents,
  updateEvent,
} from "./service.js";
import {
  createEventSchema,
  createSessionSchema,
  updateEventSchema,
  type CreateEventBody,
  type CreateSessionBody,
  type UpdateEventBody,
} from "./schemas.js";

export async function eventRoutes(app: FastifyInstance) {
  app.get("/events", async () => listEvents());

  app.get("/events/:id", async (request) => {
    const { id } = request.params as { id: string };
    return getEvent(id);
  });

  app.post(
    "/events",
    { schema: { body: createEventSchema } },
    async (request, reply) => {
      const event = await createEvent(request.body as CreateEventBody);
      return reply.status(201).send(event);
    },
  );

  app.patch(
    "/events/:id",
    { schema: { body: updateEventSchema } },
    async (request) => {
      const { id } = request.params as { id: string };
      return updateEvent(id, request.body as UpdateEventBody);
    },
  );

  app.delete("/events/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await deleteEvent(id);
    return reply.status(204).send();
  });

  app.post(
    "/events/:eventId/sessions",
    { schema: { body: createSessionSchema } },
    async (request, reply) => {
      const { eventId } = request.params as { eventId: string };
      const session = await createSession(eventId, request.body as CreateSessionBody);
      return reply.status(201).send(session);
    },
  );
}
