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
});
