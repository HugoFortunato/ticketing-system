import { PrismaClient, ReservationStatus } from "@prisma/client";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();

export const SEED_IDS = {
  users: {
    ana: "11111111-1111-4111-a111-111111111111",
    bruno: "11111111-1111-4111-a111-111111111112",
    carla: "11111111-1111-4111-a111-111111111113",
    diego: "11111111-1111-4111-a111-111111111114",
    elena: "11111111-1111-4111-a111-111111111115",
  },
  venues: {
    arena: "22222222-2222-4222-a222-222222222221",
    teatro: "22222222-2222-4222-a222-222222222222",
  },
  events: {
    rock: "33333333-3333-4333-a333-333333333331",
    theater: "33333333-3333-4333-a333-333333333332",
    soccer: "33333333-3333-4333-a333-333333333333",
    comedy: "33333333-3333-4333-a333-333333333334",
  },
  sessions: {
    rockNight: "44444444-4444-4444-a444-444444444441",
    rockLate: "44444444-4444-4444-a444-444444444442",
    theaterMatinee: "44444444-4444-4444-a444-444444444443",
    theaterEvening: "44444444-4444-4444-a444-444444444444",
    soccer: "44444444-4444-4444-a444-444444444445",
    comedy: "44444444-4444-4444-a444-444444444446",
  },
} as const;

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const SEATS_PER_ROW = 16;

function seatId(venueKey: "arena" | "teatro", index: number): string {
  const venueCode = venueKey === "arena" ? "a" : "b";
  return `55555555-5555-4555-${venueCode}${index.toString(16).padStart(3, "0")}-${index.toString().padStart(12, "0")}`;
}

function buildSeats(venueId: string, venueKey: "arena" | "teatro") {
  const seats: {
    id: string;
    venueId: string;
    section: string;
    row: string;
    number: number;
  }[] = [];
  let index = 1;
  for (const row of ROWS) {
    for (let number = 1; number <= SEATS_PER_ROW; number += 1) {
      seats.push({
        id: seatId(venueKey, index),
        venueId,
        section: "Plateia",
        row,
        number,
      });
      index += 1;
    }
  }
  return seats;
}

async function main() {
  await prisma.ticket.deleteMany();
  await prisma.reservationSeat.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.session.deleteMany();
  await prisma.event.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { id: SEED_IDS.users.ana, email: "ana@ticketing.dev", name: "Ana Souza" },
      { id: SEED_IDS.users.bruno, email: "bruno@ticketing.dev", name: "Bruno Lima" },
      { id: SEED_IDS.users.carla, email: "carla@ticketing.dev", name: "Carla Mendes" },
      { id: SEED_IDS.users.diego, email: "diego@ticketing.dev", name: "Diego Alves" },
      { id: SEED_IDS.users.elena, email: "elena@ticketing.dev", name: "Elena Costa" },
    ],
  });

  await prisma.venue.createMany({
    data: [
      {
        id: SEED_IDS.venues.arena,
        name: "Arena São Paulo",
        address: "Av. das Nações, 1000",
        city: "São Paulo",
      },
      {
        id: SEED_IDS.venues.teatro,
        name: "Teatro Municipal",
        address: "Praça Ramos de Azevedo, 200",
        city: "São Paulo",
      },
    ],
  });

  const arenaSeats = buildSeats(SEED_IDS.venues.arena, "arena");
  const teatroSeats = buildSeats(SEED_IDS.venues.teatro, "teatro");
  await prisma.seat.createMany({ data: [...arenaSeats, ...teatroSeats] });

  await prisma.event.createMany({
    data: [
      {
        id: SEED_IDS.events.rock,
        name: "Noite Elétrica",
        description:
          "Festival de rock com três bandas nacionais. Palco principal, som ao vivo e pista aberta.",
        imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
        category: "Show",
        venueId: SEED_IDS.venues.arena,
      },
      {
        id: SEED_IDS.events.theater,
        name: "Hamlet",
        description: "Montagem clássica de Shakespeare com elenco convidado e temporada limitada.",
        imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80",
        category: "Teatro",
        venueId: SEED_IDS.venues.teatro,
      },
      {
        id: SEED_IDS.events.soccer,
        name: "Clássico Paulista",
        description: "Partida amistosa com arquibancadas liberadas e acesso antecipado aos portões.",
        imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80",
        category: "Esporte",
        venueId: SEED_IDS.venues.arena,
      },
      {
        id: SEED_IDS.events.comedy,
        name: "Stand-up no Municipal",
        description: "Noite de comédia com quatro artistas. Classificação 16 anos.",
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
        category: "Stand-up",
        venueId: SEED_IDS.venues.teatro,
      },
    ],
  });

  const now = new Date();
  const inDays = (days: number, hours: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    date.setHours(hours, 0, 0, 0);
    return date;
  };

  await prisma.session.createMany({
    data: [
      {
        id: SEED_IDS.sessions.rockNight,
        eventId: SEED_IDS.events.rock,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(14, 20),
        endsAt: inDays(14, 23),
      },
      {
        id: SEED_IDS.sessions.rockLate,
        eventId: SEED_IDS.events.rock,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(15, 21),
        endsAt: inDays(16, 0),
      },
      {
        id: SEED_IDS.sessions.theaterMatinee,
        eventId: SEED_IDS.events.theater,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(10, 15),
        endsAt: inDays(10, 17),
      },
      {
        id: SEED_IDS.sessions.theaterEvening,
        eventId: SEED_IDS.events.theater,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(10, 20),
        endsAt: inDays(10, 22),
      },
      {
        id: SEED_IDS.sessions.soccer,
        eventId: SEED_IDS.events.soccer,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(21, 16),
        endsAt: inDays(21, 18),
      },
      {
        id: SEED_IDS.sessions.comedy,
        eventId: SEED_IDS.events.comedy,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(7, 21),
        endsAt: inDays(7, 23),
      },
    ],
  });

  const heldSeats = arenaSeats.slice(0, 4);
  const soldSeats = arenaSeats.slice(4, 7);

  const pending = await prisma.reservation.create({
    data: {
      userId: SEED_IDS.users.bruno,
      sessionId: SEED_IDS.sessions.rockNight,
      status: ReservationStatus.PENDING,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      seats: {
        create: heldSeats.map((seat) => ({
          sessionId: SEED_IDS.sessions.rockNight,
          seatId: seat.id,
        })),
      },
    },
  });

  const confirmed = await prisma.reservation.create({
    data: {
      userId: SEED_IDS.users.carla,
      sessionId: SEED_IDS.sessions.rockNight,
      status: ReservationStatus.CONFIRMED,
      expiresAt: new Date(Date.now() - 60 * 1000),
      seats: {
        create: soldSeats.map((seat) => ({
          sessionId: SEED_IDS.sessions.rockNight,
          seatId: seat.id,
        })),
      },
    },
  });

  await prisma.ticket.createMany({
    data: soldSeats.map((seat) => ({
      reservationId: confirmed.id,
      sessionId: SEED_IDS.sessions.rockNight,
      seatId: seat.id,
      userId: SEED_IDS.users.carla,
    })),
  });

  const seedIdsPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../../load-tests/.seed-ids.json",
  );
  writeFileSync(
    seedIdsPath,
    JSON.stringify(
      {
        defaultUserId: SEED_IDS.users.ana,
        userIds: Object.values(SEED_IDS.users),
        sessionId: SEED_IDS.sessions.rockNight,
        sessions: SEED_IDS.sessions,
        events: SEED_IDS.events,
        venues: SEED_IDS.venues,
        seatCountPerVenue: arenaSeats.length,
        sampleHeldReservationId: pending.id,
        sampleTicketReservationId: confirmed.id,
      },
      null,
      2,
    ),
  );

  console.log("Seed concluído.");
  console.log(`Usuário padrão (Ana): ${SEED_IDS.users.ana}`);
  console.log(`Sessão principal para load tests: ${SEED_IDS.sessions.rockNight}`);
  console.log(`Assentos por venue: ${arenaSeats.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
