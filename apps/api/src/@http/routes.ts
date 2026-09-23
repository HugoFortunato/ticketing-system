import { FastifyInstance } from "fastify"
import { createEvent } from "./@controllers/create-event.js"
import { createSession } from "./@controllers/create-session.js"
import { getEvent } from "./@controllers/get-event.js"
import { getEvents } from "./@controllers/get-events.js"
import { getSession } from "./@controllers/get-session.js"
import { getSearch } from "./@controllers/get-search.js"
import { listSessionSeats } from "./@controllers/list-session-seats.js"
import { confirmReservation } from "./@controllers/confirm-reservation.js"
import { createReservation } from "./@controllers/create-reservation.js"
import { getReservation } from "./@controllers/get-reservation.js"
import { getTicket } from "./@controllers/get-ticket.js"

export async function appRoutes(app: FastifyInstance) {
  app.get("/search", getSearch)
  app.get("/events", getEvents)
  app.get("/events/:id", getEvent)
  app.get("/sessions/:id", getSession)
  app.get("/sessions/:sessionId/seats", listSessionSeats)
  app.get("/reservations/:id", getReservation)
  app.get("/tickets/:id", getTicket)
  app.post("/events", createEvent)
  app.post("/events/:eventId/sessions", createSession)
  app.post("/sessions/:sessionId/reservations", createReservation)
  app.post("/reservations/:id/confirm", confirmReservation)
}
