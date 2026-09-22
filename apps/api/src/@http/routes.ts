import { FastifyInstance } from "fastify"
import { createEvent } from "./@controllers/create-event.js"
import { createSession } from "./@controllers/create-session.js"
import { getEvent } from "./@controllers/get-event.js"
import { getEvents } from "./@controllers/get-events.js"
import { getSession } from "./@controllers/get-session.js"
import { getSearch } from "./@controllers/get-search.js"

export async function appRoutes(app: FastifyInstance) {
  app.get("/search", getSearch)
  app.get("/events", getEvents)
  app.get("/events/:id", getEvent)
  app.get("/sessions/:id", getSession)
  app.post("/events", createEvent)
  app.post("/events/:eventId/sessions", createSession)
}
