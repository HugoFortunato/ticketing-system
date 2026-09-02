import { FastifyInstance } from 'fastify'
import { createEvent } from './@controllers/create-event.js'

export async function appRoutes(app: FastifyInstance) {
  app.post('/events', createEvent)
}
// app.post(
//     "/events",
//     { schema: { body: createEventSchema } },
//     async (request, reply) => {
//       const event = await createEvent(request.body as CreateEventBody);
//       return reply.status(201).send(event);
//     },
//   );
