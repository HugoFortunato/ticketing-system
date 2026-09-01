import { ReservationStatus } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

const userId = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";

async function createFixture() {
  const venue = await prisma.venue.create({
    data: {
      name: `Venue ${Date.now()}`,
      address: "Rua Teste, 1",
      city: "São Paulo",
    },
  });

  const seats = await prisma.$transaction(
    ["A", "B"].flatMap((row) =>
      [1, 2, 3].map((number) =>
        prisma.seat.create({
          data: {
            venueId: venue.id,
            section: "Plateia",
            row,
            number,
          },
        }),
      ),
    ),
  );

  const event = await prisma.event.create({
    data: {
      name: `Evento ${Date.now()}`,
      description: "Evento de teste",
      imageUrl: "https://example.com/image.jpg",
      category: "Show",
      venueId: venue.id,
    },
  });

  return { venue, seats, event };
}

describe("fluxos críticos", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: "tester@ticketing.dev",
        name: "Tester",
      },
    });
    app = await buildApp();
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { userId } });
    await prisma.reservationSeat.deleteMany({
      where: { reservation: { userId } },
    });
    await prisma.reservation.deleteMany({ where: { userId } });
    await prisma.event.deleteMany({
      where: {
        OR: [{ name: { startsWith: "Evento " } }, { name: "Novo Show" }, { description: "Evento de teste" }],
      },
    });
    await prisma.seat.deleteMany({
      where: { venue: { name: { startsWith: "Venue " } } },
    });
    await prisma.session.deleteMany({
      where: { venue: { name: { startsWith: "Venue " } } },
    });
    await prisma.venue.deleteMany({
      where: { name: { startsWith: "Venue " } },
    });
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  it("cria um evento", async () => {
    const { venue } = await createFixture();
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
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.name).toBe("Novo Show");
    expect(body.venueId).toBe(venue.id);
  });

  it("lista eventos só com campos da home e usa cache", async () => {
    const miss = await app.inject({ method: "GET", url: "/events" });
    expect(miss.statusCode).toBe(200);
    expect(miss.headers["x-cache"]).toBe("MISS");

    const body = miss.json() as Record<string, unknown>[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    const item = body[0]!;
    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("name");
    expect(item).toHaveProperty("category");
    expect(item).toHaveProperty("imageUrl");
    expect(item).toHaveProperty("nextSessionStartsAt");
    expect(item).not.toHaveProperty("description");
    expect(item).not.toHaveProperty("sessions");
    expect(item.venue).toEqual(
      expect.objectContaining({ name: expect.any(String), city: expect.any(String) }),
    );
    expect(item.venue).not.toHaveProperty("address");

    const hit = await app.inject({ method: "GET", url: "/events" });
    expect(hit.statusCode).toBe(200);
    expect(hit.headers["x-cache"]).toBe("HIT");
    expect(hit.json()).toEqual(body);
  });

  it("detalha um evento com venue, sessões e usa cache", async () => {
    const { event } = await createFixture();
    const miss = await app.inject({ method: "GET", url: `/events/${event.id}` });
    expect(miss.statusCode).toBe(200);
    expect(miss.headers["x-cache"]).toBe("MISS");

    const body = miss.json() as Record<string, unknown>;
    expect(body.id).toBe(event.id);
    expect(body).toHaveProperty("description");
    expect(Array.isArray(body.sessions)).toBe(true);
    expect(body.venue).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        city: expect.any(String),
        address: expect.any(String),
      }),
    );

    const hit = await app.inject({ method: "GET", url: `/events/${event.id}` });
    expect(hit.statusCode).toBe(200);
    expect(hit.headers["x-cache"]).toBe("HIT");
    expect(hit.json().id).toBe(event.id);
  });

  it("cria uma sessão", async () => {
    const { event } = await createFixture();
    const startsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const endsAt = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();

    const response = await app.inject({
      method: "POST",
      url: `/events/${event.id}/sessions`,
      payload: { startsAt, endsAt },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.eventId).toBe(event.id);
    expect(body.venueId).toBe(event.venueId);
  });

  it("consulta assentos de uma sessão", async () => {
    const { event, seats } = await createFixture();
    const session = await prisma.session.create({
      data: {
        eventId: event.id,
        venueId: event.venueId,
        startsAt: new Date(Date.now() + 86_400_000),
        endsAt: new Date(Date.now() + 90_000_000),
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/sessions/${session.id}/seats`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.seats).toHaveLength(seats.length);
    expect(body.seats.every((seat: { status: string }) => seat.status === "available")).toBe(
      true,
    );
  });

  it("cria e confirma uma reserva", async () => {
    const { event, seats } = await createFixture();
    const session = await prisma.session.create({
      data: {
        eventId: event.id,
        venueId: event.venueId,
        startsAt: new Date(Date.now() + 86_400_000),
        endsAt: new Date(Date.now() + 90_000_000),
      },
    });

    const selected = seats.slice(0, 2).map((seat) => seat.id);
    const created = await app.inject({
      method: "POST",
      url: `/sessions/${session.id}/reservations`,
      headers: { "x-user-id": userId },
      payload: { seatIds: selected },
    });

    expect(created.statusCode).toBe(201);
    const reservation = created.json();
    expect(reservation.status).toBe(ReservationStatus.PENDING);
    expect(reservation.seats).toHaveLength(2);

    const confirmed = await app.inject({
      method: "POST",
      url: `/reservations/${reservation.id}/confirm`,
      headers: { "x-user-id": userId },
    });

    expect(confirmed.statusCode).toBe(200);
    const confirmedBody = confirmed.json();
    expect(confirmedBody.status).toBe(ReservationStatus.CONFIRMED);
    expect(confirmedBody.tickets).toHaveLength(2);
  });

  it("rejeita reserva de assento indisponível", async () => {
    const { event, seats } = await createFixture();
    const session = await prisma.session.create({
      data: {
        eventId: event.id,
        venueId: event.venueId,
        startsAt: new Date(Date.now() + 86_400_000),
        endsAt: new Date(Date.now() + 90_000_000),
      },
    });
    const seatId = seats[0]!.id;

    const first = await app.inject({
      method: "POST",
      url: `/sessions/${session.id}/reservations`,
      headers: { "x-user-id": userId },
      payload: { seatIds: [seatId] },
    });
    expect(first.statusCode).toBe(201);

    const second = await app.inject({
      method: "POST",
      url: `/sessions/${session.id}/reservations`,
      headers: { "x-user-id": userId },
      payload: { seatIds: [seatId] },
    });

    expect(second.statusCode).toBe(409);
    expect(second.json().error).toBe("CONFLICT");
  });

  it("pesquisa eventos no Postgres e devolve o payload da home", async () => {
    const { event } = await createFixture();
    const unique = `ZebraSearch${Date.now()}`;
    await prisma.event.update({
      where: { id: event.id },
      data: { name: unique },
    });

    const empty = await app.inject({ method: "GET", url: "/search" });
    expect(empty.statusCode).toBe(200);
    expect(empty.headers["x-search-engine"]).toBe("postgres");
    expect(empty.json()).toEqual([]);

    const found = await app.inject({
      method: "GET",
      url: `/search?q=${encodeURIComponent(unique)}`,
    });
    expect(found.statusCode).toBe(200);
    expect(found.headers["x-search-engine"]).toBe("postgres");
    const body = found.json() as Record<string, unknown>[];
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({
      id: event.id,
      name: unique,
    });
    expect(body[0]).not.toHaveProperty("description");
    expect(body[0]).not.toHaveProperty("sessions");

    const miss = await app.inject({ method: "GET", url: "/search?q=zzzz-nenhum-evento" });
    expect(miss.statusCode).toBe(200);
    expect(miss.json()).toEqual([]);
  });
});
