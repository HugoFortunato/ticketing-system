import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { buildApp } from "../src/app.js"
import { prisma } from "../src/lib/prisma.js"
import { MOCK_AUTHOR_USER_ID } from "../src/@use-cases/events/create-event.js"

const ANA = MOCK_AUTHOR_USER_ID

async function createVenue() {
  return prisma.venue.create({
    data: {
      name: `Venue ${Date.now()}`,
      address: "Rua Teste, 1",
      city: "São Paulo",
    },
  })
}

describe("API live (eventos e sessões)", () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  beforeAll(async () => {
    await prisma.user.upsert({
      where: { id: ANA },
      update: {},
      create: {
        id: ANA,
        email: "ana@ticketing.dev",
        name: "Ana",
      },
    })
    app = await buildApp()
  })

  afterAll(async () => {
    await prisma.ticket.deleteMany({
      where: { session: { venue: { name: { startsWith: "Venue " } } } },
    })
    await prisma.reservationSeat.deleteMany({
      where: { reservation: { session: { venue: { name: { startsWith: "Venue " } } } } },
    })
    await prisma.reservation.deleteMany({
      where: { session: { venue: { name: { startsWith: "Venue " } } } },
    })
    await prisma.session.deleteMany({
      where: { venue: { name: { startsWith: "Venue " } } },
    })
    await prisma.seat.deleteMany({
      where: { venue: { name: { startsWith: "Venue " } } },
    })
    await prisma.event.deleteMany({
      where: {
        OR: [{ name: { startsWith: "Evento " } }, { name: "Novo Show" }],
      },
    })
    await prisma.venue.deleteMany({
      where: { name: { startsWith: "Venue " } },
    })
    await app.close()
  })

  it("cria evento e devolve envelope { event }", async () => {
    const venue = await createVenue()
    const response = await app.inject({
      method: "POST",
      url: "/events",
      payload: {
        name: "Novo Show",
        description: "Descrição",
        imageUrl: "https://example.com/show.jpg",
        category: "Show",
        venueId: venue.id,
      },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json() as { event: { name: string; venueId: string; userId: string } }
    expect(body.event.name).toBe("Novo Show")
    expect(body.event.venueId).toBe(venue.id)
    expect(body.event.userId).toBe(ANA)
  })

  it("create com venue inexistente devolve 404 VENUE_NOT_FOUND", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/events",
      payload: {
        name: "Sem local",
        description: "Descrição",
        imageUrl: "https://example.com/show.jpg",
        category: "Show",
        venueId: "00000000-0000-4000-8000-000000000099",
      },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error).toBe("VENUE_NOT_FOUND")
  })

  it("lista eventos no envelope { events }", async () => {
    const response = await app.inject({ method: "GET", url: "/events" })
    expect(response.statusCode).toBe(200)
    const body = response.json() as { events: Record<string, unknown>[] }
    expect(Array.isArray(body.events)).toBe(true)
    expect(body.events.length).toBeGreaterThan(0)
    const item = body.events[0]!
    expect(item).toHaveProperty("id")
    expect(item).toHaveProperty("name")
    expect(item).not.toHaveProperty("description")
  })

  it("get event sem x-user-id devolve 401", async () => {
    const response = await app.inject({ method: "GET", url: "/events/qualquer" })
    expect(response.statusCode).toBe(401)
    expect(response.json().error).toBe("UNAUTHORIZED")
  })

  it("get event inexistente devolve 404", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/events/00000000-0000-4000-8000-000000000001",
      headers: { "x-user-id": ANA },
    })
    expect(response.statusCode).toBe(404)
    expect(response.json().error).toBe("EVENT_NOT_FOUND")
  })

  it("detalha o evento criado pelo mock autor", async () => {
    const venue = await createVenue()
    const created = await app.inject({
      method: "POST",
      url: "/events",
      payload: {
        name: `Evento ${Date.now()}`,
        description: "Evento de teste",
        imageUrl: "https://example.com/image.jpg",
        category: "Show",
        venueId: venue.id,
      },
    })
    const { event } = created.json() as { event: { id: string } }

    const forbidden = await app.inject({
      method: "GET",
      url: `/events/${event.id}`,
      headers: { "x-user-id": "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa" },
    })
    expect(forbidden.statusCode).toBe(403)
    expect(forbidden.json().error).toBe("FORBIDDEN")

    const ok = await app.inject({
      method: "GET",
      url: `/events/${event.id}`,
      headers: { "x-user-id": ANA },
    })
    expect(ok.statusCode).toBe(200)
    const body = ok.json() as { event: { id: string; sessions: unknown[] } }
    expect(body.event.id).toBe(event.id)
    expect(Array.isArray(body.event.sessions)).toBe(true)
  })

  it("cria e lê sessão", async () => {
    const venue = await createVenue()
    const created = await app.inject({
      method: "POST",
      url: "/events",
      payload: {
        name: `Evento ${Date.now()}`,
        description: "Evento de teste",
        imageUrl: "https://example.com/image.jpg",
        category: "Show",
        venueId: venue.id,
      },
    })
    const { event } = created.json() as { event: { id: string; venueId: string } }
    const startsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const endsAt = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString()

    const sessionRes = await app.inject({
      method: "POST",
      url: `/events/${event.id}/sessions`,
      payload: { startsAt, endsAt },
    })
    expect(sessionRes.statusCode).toBe(201)
    const { session } = sessionRes.json() as {
      session: { id: string; eventId: string; venueId: string }
    }
    expect(session.eventId).toBe(event.id)
    expect(session.venueId).toBe(event.venueId)

    const getRes = await app.inject({
      method: "GET",
      url: `/sessions/${session.id}`,
    })
    expect(getRes.statusCode).toBe(200)
    expect(getRes.json().session.id).toBe(session.id)
    expect(getRes.json().session.event.id).toBe(event.id)
  })

  it("sessão com datas invertidas devolve 400", async () => {
    const venue = await createVenue()
    const created = await app.inject({
      method: "POST",
      url: "/events",
      payload: {
        name: `Evento ${Date.now()}`,
        description: "Evento de teste",
        imageUrl: "https://example.com/image.jpg",
        category: "Show",
        venueId: venue.id,
      },
    })
    const { event } = created.json() as { event: { id: string } }
    const startsAt = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString()
    const endsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const response = await app.inject({
      method: "POST",
      url: `/events/${event.id}/sessions`,
      payload: { startsAt, endsAt },
    })
    expect(response.statusCode).toBe(400)
    expect(response.json().error).toBe("INVALID_SESSION_SCHEDULE")
  })

  it("get session inexistente devolve 404", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/sessions/00000000-0000-4000-8000-000000000001",
    })
    expect(response.statusCode).toBe(404)
    expect(response.json().error).toBe("SESSION_NOT_FOUND")
  })

  it("lista assentos de uma sessão sem x-user-id", async () => {
    const venue = await createVenue()
    await prisma.seat.create({
      data: {
        venueId: venue.id,
        section: "Plateia",
        row: "A",
        number: 1,
      },
    })
    const created = await app.inject({
      method: "POST",
      url: "/events",
      payload: {
        name: `Evento ${Date.now()}`,
        description: "Evento de teste",
        imageUrl: "https://example.com/image.jpg",
        category: "Show",
        venueId: venue.id,
      },
    })
    const { event } = created.json() as { event: { id: string } }
    const startsAt = new Date(Date.now() + 86_400_000).toISOString()
    const endsAt = new Date(Date.now() + 90_000_000).toISOString()
    const sessionRes = await app.inject({
      method: "POST",
      url: `/events/${event.id}/sessions`,
      payload: { startsAt, endsAt },
    })
    const { session } = sessionRes.json() as { session: { id: string } }

    const response = await app.inject({
      method: "GET",
      url: `/sessions/${session.id}/seats`,
    })
    expect(response.statusCode).toBe(200)
    const body = response.json() as {
      sessionId: string
      seats: { status: string }[]
    }
    expect(body.sessionId).toBe(session.id)
    expect(body.seats.length).toBeGreaterThan(0)
    expect(body.seats.every((seat) => seat.status === "available")).toBe(true)
  })

  it("assentos de sessão inexistente devolve 404", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/sessions/00000000-0000-4000-8000-000000000001/seats",
    })
    expect(response.statusCode).toBe(404)
    expect(response.json().error).toBe("SESSION_NOT_FOUND")
  })

  it("cria hold e lê reserva sem header no GET", async () => {
    const venue = await createVenue()
    const seat = await prisma.seat.create({
      data: {
        venueId: venue.id,
        section: "Plateia",
        row: "A",
        number: 1,
      },
    })
    const created = await app.inject({
      method: "POST",
      url: "/events",
      payload: {
        name: `Evento ${Date.now()}`,
        description: "Evento de teste",
        imageUrl: "https://example.com/image.jpg",
        category: "Show",
        venueId: venue.id,
      },
    })
    const { event } = created.json() as { event: { id: string } }
    const startsAt = new Date(Date.now() + 86_400_000).toISOString()
    const endsAt = new Date(Date.now() + 90_000_000).toISOString()
    const sessionRes = await app.inject({
      method: "POST",
      url: `/events/${event.id}/sessions`,
      payload: { startsAt, endsAt },
    })
    const { session } = sessionRes.json() as { session: { id: string } }

    const unauthorized = await app.inject({
      method: "POST",
      url: `/sessions/${session.id}/reservations`,
      payload: { seatIds: [seat.id] },
    })
    expect(unauthorized.statusCode).toBe(401)

    const missingSession = await app.inject({
      method: "POST",
      url: "/sessions/00000000-0000-4000-8000-000000000001/reservations",
      headers: { "x-user-id": ANA },
      payload: { seatIds: [seat.id] },
    })
    expect(missingSession.statusCode).toBe(404)
    expect(missingSession.json().error).toBe("SESSION_NOT_FOUND")

    const createdHold = await app.inject({
      method: "POST",
      url: `/sessions/${session.id}/reservations`,
      headers: { "x-user-id": ANA },
      payload: { seatIds: [seat.id] },
    })
    expect(createdHold.statusCode).toBe(201)
    const reservation = createdHold.json() as { id: string; status: string }
    expect(reservation.status).toBe("PENDING")
    expect(reservation.id).toBeTruthy()

    const conflict = await app.inject({
      method: "POST",
      url: `/sessions/${session.id}/reservations`,
      headers: { "x-user-id": ANA },
      payload: { seatIds: [seat.id] },
    })
    expect(conflict.statusCode).toBe(409)
    expect(conflict.json().error).toBe("CONFLICT")

    const got = await app.inject({
      method: "GET",
      url: `/reservations/${reservation.id}`,
    })
    expect(got.statusCode).toBe(200)
    expect(got.json().id).toBe(reservation.id)
    expect(got.json().status).toBe("PENDING")
  })

  it("confirma hold, gera ingresso e GET ticket sem header", async () => {
    const venue = await createVenue()
    const seat = await prisma.seat.create({
      data: {
        venueId: venue.id,
        section: "Plateia",
        row: "A",
        number: 1,
      },
    })
    const created = await app.inject({
      method: "POST",
      url: "/events",
      payload: {
        name: `Evento ${Date.now()}`,
        description: "Evento de teste",
        imageUrl: "https://example.com/image.jpg",
        category: "Show",
        venueId: venue.id,
      },
    })
    const { event } = created.json() as { event: { id: string } }
    const startsAt = new Date(Date.now() + 86_400_000).toISOString()
    const endsAt = new Date(Date.now() + 90_000_000).toISOString()
    const sessionRes = await app.inject({
      method: "POST",
      url: `/events/${event.id}/sessions`,
      payload: { startsAt, endsAt },
    })
    const { session } = sessionRes.json() as { session: { id: string } }
    const hold = await app.inject({
      method: "POST",
      url: `/sessions/${session.id}/reservations`,
      headers: { "x-user-id": ANA },
      payload: { seatIds: [seat.id] },
    })
    const reservation = hold.json() as { id: string }

    const unauthorized = await app.inject({
      method: "POST",
      url: `/reservations/${reservation.id}/confirm`,
    })
    expect(unauthorized.statusCode).toBe(401)

    const other = await prisma.user.create({
      data: {
        email: `other-${Date.now()}@ticketing.dev`,
        name: "Outro",
      },
    })
    const forbidden = await app.inject({
      method: "POST",
      url: `/reservations/${reservation.id}/confirm`,
      headers: { "x-user-id": other.id },
    })
    expect(forbidden.statusCode).toBe(403)
    expect(forbidden.json().error).toBe("FORBIDDEN")

    const confirmed = await app.inject({
      method: "POST",
      url: `/reservations/${reservation.id}/confirm`,
      headers: { "x-user-id": ANA },
    })
    expect(confirmed.statusCode).toBe(200)
    const body = confirmed.json() as {
      status: string
      tickets: { id: string }[]
    }
    expect(body.status).toBe("CONFIRMED")
    expect(body.tickets).toHaveLength(1)
    const ticketId = body.tickets[0]?.id
    expect(ticketId).toBeTruthy()

    const again = await app.inject({
      method: "POST",
      url: `/reservations/${reservation.id}/confirm`,
      headers: { "x-user-id": ANA },
    })
    expect(again.statusCode).toBe(200)
    expect(again.json().tickets).toHaveLength(1)

    const ticket = await app.inject({
      method: "GET",
      url: `/tickets/${ticketId}`,
    })
    expect(ticket.statusCode).toBe(200)
    expect(ticket.json().id).toBe(ticketId)
    expect(ticket.json().session.event.name).toBeTruthy()
  })

  it("confirm de reserva inexistente e ticket inexistente", async () => {
    const missingReservation = await app.inject({
      method: "POST",
      url: "/reservations/00000000-0000-4000-8000-000000000001/confirm",
      headers: { "x-user-id": ANA },
    })
    expect(missingReservation.statusCode).toBe(404)
    expect(missingReservation.json().error).toBe("RESERVATION_NOT_FOUND")

    const missingTicket = await app.inject({
      method: "GET",
      url: "/tickets/00000000-0000-4000-8000-000000000001",
    })
    expect(missingTicket.statusCode).toBe(404)
    expect(missingTicket.json().error).toBe("TICKET_NOT_FOUND")
  })

  it("confirm após expiry devolve 409 e GET mostra EXPIRED", async () => {
    const venue = await createVenue()
    const seat = await prisma.seat.create({
      data: {
        venueId: venue.id,
        section: "Plateia",
        row: "B",
        number: 1,
      },
    })
    const created = await app.inject({
      method: "POST",
      url: "/events",
      payload: {
        name: `Evento ${Date.now()}`,
        description: "Evento de teste",
        imageUrl: "https://example.com/image.jpg",
        category: "Show",
        venueId: venue.id,
      },
    })
    const { event } = created.json() as { event: { id: string } }
    const startsAt = new Date(Date.now() + 86_400_000).toISOString()
    const endsAt = new Date(Date.now() + 90_000_000).toISOString()
    const sessionRes = await app.inject({
      method: "POST",
      url: `/events/${event.id}/sessions`,
      payload: { startsAt, endsAt },
    })
    const { session } = sessionRes.json() as { session: { id: string } }
    const hold = await app.inject({
      method: "POST",
      url: `/sessions/${session.id}/reservations`,
      headers: { "x-user-id": ANA },
      payload: { seatIds: [seat.id] },
    })
    const reservation = hold.json() as { id: string }

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    })

    const expired = await app.inject({
      method: "POST",
      url: `/reservations/${reservation.id}/confirm`,
      headers: { "x-user-id": ANA },
    })
    expect(expired.statusCode).toBe(409)
    expect(expired.json().error).toBe("CONFLICT")

    const got = await app.inject({
      method: "GET",
      url: `/reservations/${reservation.id}`,
    })
    expect(got.statusCode).toBe(200)
    expect(got.json().status).toBe("EXPIRED")
  })

  it("get reserva inexistente devolve 404", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/reservations/00000000-0000-4000-8000-000000000001",
    })
    expect(response.statusCode).toBe(404)
    expect(response.json().error).toBe("RESERVATION_NOT_FOUND")
  })
})
