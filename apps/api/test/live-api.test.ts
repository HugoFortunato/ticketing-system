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
    app = await buildApp()
  })

  afterAll(async () => {
    await prisma.session.deleteMany({
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
})
