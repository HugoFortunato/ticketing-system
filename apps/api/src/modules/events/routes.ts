import type { FastifyInstance } from "fastify";
import {
  createSession,
  deleteEvent,
  getEventWithCache,
  listEvents,
  updateEvent,
} from "./service.js";
import {
  createSessionSchema,
  updateEventSchema,
  type CreateSessionBody,
  type UpdateEventBody,
} from "./schemas.js";

export async function eventRoutes(app: FastifyInstance) {
  app.get("/events", async (_request, reply) => {
    const { events, cache } = await listEvents();
    return reply.header("X-Cache", cache).send(events);
  });

  app.get("/events/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { event, cache } = await getEventWithCache(id);
    return reply.header("X-Cache", cache).send(event);
  });

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
