import { FastifyInstance } from 'fastify'
import { createEvent } from './@controllers/create-event.js'
import { getEvent } from './@controllers/get-event.js'
import { getEvents } from './@controllers/get-events.js'

export async function appRoutes(app: FastifyInstance) {
  app.post('/events', createEvent)
  app.get('/events', getEvents)
  app.get('/events/:id', getEvent)
}

