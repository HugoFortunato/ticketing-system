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
    pop: "33333333-3333-4333-a333-333333333335",
    jazz: "33333333-3333-4333-a333-333333333336",
    sertanejo: "33333333-3333-4333-a333-333333333337",
    musical: "33333333-3333-4333-a333-333333333338",
    drama: "33333333-3333-4333-a333-333333333339",
    kidsTheater: "33333333-3333-4333-a333-333333333340",
    basketball: "33333333-3333-4333-a333-333333333341",
    tennis: "33333333-3333-4333-a333-333333333342",
    improv: "33333333-3333-4333-a333-333333333343",
    roast: "33333333-3333-4333-a333-333333333344",
    samba: "33333333-3333-4333-a333-333333333345",
    electronic: "33333333-3333-4333-a333-333333333346",
    indie: "33333333-3333-4333-a333-333333333347",
    opera: "33333333-3333-4333-a333-333333333348",
    costumePlay: "33333333-3333-4333-a333-333333333349",
    ballet: "33333333-3333-4333-a333-333333333350",
    volleyball: "33333333-3333-4333-a333-333333333351",
    mma: "33333333-3333-4333-a333-333333333352",
    womenComedy: "33333333-3333-4333-a333-333333333353",
    talkShow: "33333333-3333-4333-a333-333333333354",
  },
  sessions: {
    rockNight: "44444444-4444-4444-a444-444444444441",
    rockLate: "44444444-4444-4444-a444-444444444442",
    theaterMatinee: "44444444-4444-4444-a444-444444444443",
    theaterEvening: "44444444-4444-4444-a444-444444444444",
    soccer: "44444444-4444-4444-a444-444444444445",
    comedy: "44444444-4444-4444-a444-444444444446",
    popNight: "44444444-4444-4444-a444-444444444447",
    popLate: "44444444-4444-4444-a444-444444444448",
    jazzNight: "44444444-4444-4444-a444-444444444449",
    jazzMatinee: "44444444-4444-4444-a444-44444444444a",
    sertanejoNight: "44444444-4444-4444-a444-44444444444b",
    sertanejoLate: "44444444-4444-4444-a444-44444444444c",
    musicalMatinee: "44444444-4444-4444-a444-44444444444d",
    musicalEvening: "44444444-4444-4444-a444-44444444444e",
    dramaMatinee: "44444444-4444-4444-a444-44444444444f",
    dramaEvening: "44444444-4444-4444-a444-444444444450",
    kidsMatinee: "44444444-4444-4444-a444-444444444451",
    kidsAfternoon: "44444444-4444-4444-a444-444444444452",
    basketball: "44444444-4444-4444-a444-444444444453",
    basketballFinal: "44444444-4444-4444-a444-444444444454",
    tennis: "44444444-4444-4444-a444-444444444455",
    tennisFinal: "44444444-4444-4444-a444-444444444456",
    improvNight: "44444444-4444-4444-a444-444444444457",
    improvLate: "44444444-4444-4444-a444-444444444458",
    roastNight: "44444444-4444-4444-a444-444444444459",
    roastLate: "44444444-4444-4444-a444-44444444445a",
    sambaNight: "44444444-4444-4444-a444-44444444445b",
    sambaLate: "44444444-4444-4444-a444-44444444445c",
    sambaEncore: "44444444-4444-4444-a444-44444444445d",
    electronicNight: "44444444-4444-4444-a444-44444444445e",
    electronicLate: "44444444-4444-4444-a444-44444444445f",
    electronicDawn: "44444444-4444-4444-a444-444444444460",
    indieNight: "44444444-4444-4444-a444-444444444461",
    indieMatinee: "44444444-4444-4444-a444-444444444462",
    indieLate: "44444444-4444-4444-a444-444444444463",
    operaMatinee: "44444444-4444-4444-a444-444444444464",
    operaEvening: "44444444-4444-4444-a444-444444444465",
    operaGala: "44444444-4444-4444-a444-444444444466",
    costumeMatinee: "44444444-4444-4444-a444-444444444467",
    costumeEvening: "44444444-4444-4444-a444-444444444468",
    costumeWeekend: "44444444-4444-4444-a444-444444444469",
    balletMatinee: "44444444-4444-4444-a444-44444444446a",
    balletEvening: "44444444-4444-4444-a444-44444444446b",
    balletGala: "44444444-4444-4444-a444-44444444446c",
    volleyball: "44444444-4444-4444-a444-44444444446d",
    volleyballSemi: "44444444-4444-4444-a444-44444444446e",
    volleyballFinal: "44444444-4444-4444-a444-44444444446f",
    mma: "44444444-4444-4444-a444-444444444470",
    mmaMain: "44444444-4444-4444-a444-444444444471",
    mmaEncore: "44444444-4444-4444-a444-444444444472",
    womenComedyNight: "44444444-4444-4444-a444-444444444473",
    womenComedyLate: "44444444-4444-4444-a444-444444444474",
    womenComedyWeekend: "44444444-4444-4444-a444-444444444475",
    talkShowNight: "44444444-4444-4444-a444-444444444476",
    talkShowLate: "44444444-4444-4444-a444-444444444477",
    talkShowWeekend: "44444444-4444-4444-a444-444444444478",
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
      {
        id: SEED_IDS.events.pop,
        name: "Pop na Arena",
        description: "Turnê de pop com convidados e palco 360. Pista e camarotes.",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
        category: "Show",
        venueId: SEED_IDS.venues.arena,
      },
      {
        id: SEED_IDS.events.jazz,
        name: "Jazz no Municipal",
        description: "Quinteto de jazz com repertório clássico e origens brasileiras.",
        imageUrl: "https://images.unsplash.com/photo-1415201364774-f6f0bb35bef6?w=1200&q=80",
        category: "Show",
        venueId: SEED_IDS.venues.teatro,
      },
      {
        id: SEED_IDS.events.sertanejo,
        name: "Sertanejo ao Vivo",
        description: "Dupla sertaneja com banda completa e abertura de artistas regionais.",
        imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80",
        category: "Show",
        venueId: SEED_IDS.venues.arena,
      },
      {
        id: SEED_IDS.events.musical,
        name: "Les Misérables",
        description: "Musical em temporada limitada com orquestra ao vivo.",
        imageUrl: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=1200&q=80",
        category: "Teatro",
        venueId: SEED_IDS.venues.teatro,
      },
      {
        id: SEED_IDS.events.drama,
        name: "Esperando Godot",
        description: "Drama existencialista com elenco convidado e cenografia minimalista.",
        imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&q=80",
        category: "Teatro",
        venueId: SEED_IDS.venues.teatro,
      },
      {
        id: SEED_IDS.events.kidsTheater,
        name: "O Pequeno Príncipe",
        description: "Peça infantil para todas as idades. Duração 70 minutos.",
        imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&q=80",
        category: "Teatro",
        venueId: SEED_IDS.venues.teatro,
      },
      {
        id: SEED_IDS.events.basketball,
        name: "Final de Basquete",
        description: "Jogo decisivo da liga com arquibancadas liberadas.",
        imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80",
        category: "Esporte",
        venueId: SEED_IDS.venues.arena,
      },
      {
        id: SEED_IDS.events.tennis,
        name: "Open de Tênis",
        description: "Semifinal e final em quadra central coberta.",
        imageUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80",
        category: "Esporte",
        venueId: SEED_IDS.venues.arena,
      },
      {
        id: SEED_IDS.events.improv,
        name: "Improvável",
        description: "Noite de improvisação com plateia sugerindo cenas. Classificação 14 anos.",
        imageUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&q=80",
        category: "Stand-up",
        venueId: SEED_IDS.venues.teatro,
      },
      {
        id: SEED_IDS.events.roast,
        name: "Roast da Cidade",
        description: "Comediantes convidados em formato roast. Classificação 18 anos.",
        imageUrl: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=1200&q=80",
        category: "Stand-up",
        venueId: SEED_IDS.venues.teatro,
      },
      {
        id: SEED_IDS.events.samba,
        name: "Samba na Arena",
        description:
          "Roda de samba com escolas convidadas, bateria completa e convidados da MPB. Pista aberta e camarotes.",
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80",
        category: "Show",
        venueId: SEED_IDS.venues.arena,
      },
      {
        id: SEED_IDS.events.electronic,
        name: "After Hours",
        description:
          "Festival de eletrônica com três DJs headliners, palco principal e sala de house até o amanhecer.",
        imageUrl: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=1200&q=80",
        category: "Show",
        venueId: SEED_IDS.venues.arena,
      },
      {
        id: SEED_IDS.events.indie,
        name: "Indie Session",
        description:
          "Mostra de bandas independentes com três atos nacionais e palco intimista no Municipal.",
        imageUrl: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=1200&q=80",
        category: "Show",
        venueId: SEED_IDS.venues.teatro,
      },
      {
        id: SEED_IDS.events.opera,
        name: "Carmen",
        description:
          "Ópera de Bizet em temporada limitada, com orquestra e coro convidados. Supertítulos em português.",
        imageUrl: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200&q=80",
        category: "Teatro",
        venueId: SEED_IDS.venues.teatro,
      },
      {
        id: SEED_IDS.events.costumePlay,
        name: "Comédia de Costumes",
        description:
          "Texto original sobre a vida em São Paulo, com três atos e elenco fixo da casa.",
        imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80",
        category: "Teatro",
        venueId: SEED_IDS.venues.teatro,
      },
      {
        id: SEED_IDS.events.ballet,
        name: "O Lago dos Cisnes",
        description:
          "Ballet clássico com companhia convidada, orquestra ao vivo e duas pausas de 15 minutos.",
        imageUrl: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1200&q=80",
        category: "Teatro",
        venueId: SEED_IDS.venues.teatro,
      },
      {
        id: SEED_IDS.events.volleyball,
        name: "Superliga de Vôlei",
        description:
          "Semifinal e final da temporada. Arquibancadas liberadas e aquecimento visível 40 minutos antes.",
        imageUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&q=80",
        category: "Esporte",
        venueId: SEED_IDS.venues.arena,
      },
      {
        id: SEED_IDS.events.mma,
        name: "Fight Night",
        description:
          "Card de MMA com luta principal em cinco rounds e preliminares a partir das 18h.",
        imageUrl: "https://images.unsplash.com/photo-1549719386-0bfdd808ba61?w=1200&q=80",
        category: "Esporte",
        venueId: SEED_IDS.venues.arena,
      },
      {
        id: SEED_IDS.events.womenComedy,
        name: "Noite das Comediantes",
        description:
          "Stand-up com cinco artistas. Classificação 16 anos. Abertura com convidada surpresa.",
        imageUrl: "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=1200&q=80",
        category: "Stand-up",
        venueId: SEED_IDS.venues.teatro,
      },
      {
        id: SEED_IDS.events.talkShow,
        name: "Late Night ao Vivo",
        description:
          "Gravação de talk show com banda ao vivo, convidados e participação da plateia.",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80",
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
      {
        id: SEED_IDS.sessions.popNight,
        eventId: SEED_IDS.events.pop,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(18, 20),
        endsAt: inDays(18, 23),
      },
      {
        id: SEED_IDS.sessions.popLate,
        eventId: SEED_IDS.events.pop,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(19, 21),
        endsAt: inDays(20, 0),
      },
      {
        id: SEED_IDS.sessions.jazzNight,
        eventId: SEED_IDS.events.jazz,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(12, 20),
        endsAt: inDays(12, 22),
      },
      {
        id: SEED_IDS.sessions.jazzMatinee,
        eventId: SEED_IDS.events.jazz,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(13, 16),
        endsAt: inDays(13, 18),
      },
      {
        id: SEED_IDS.sessions.sertanejoNight,
        eventId: SEED_IDS.events.sertanejo,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(25, 20),
        endsAt: inDays(25, 23),
      },
      {
        id: SEED_IDS.sessions.sertanejoLate,
        eventId: SEED_IDS.events.sertanejo,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(26, 21),
        endsAt: inDays(27, 0),
      },
      {
        id: SEED_IDS.sessions.musicalMatinee,
        eventId: SEED_IDS.events.musical,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(11, 15),
        endsAt: inDays(11, 18),
      },
      {
        id: SEED_IDS.sessions.musicalEvening,
        eventId: SEED_IDS.events.musical,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(11, 20),
        endsAt: inDays(11, 23),
      },
      {
        id: SEED_IDS.sessions.dramaMatinee,
        eventId: SEED_IDS.events.drama,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(16, 15),
        endsAt: inDays(16, 17),
      },
      {
        id: SEED_IDS.sessions.dramaEvening,
        eventId: SEED_IDS.events.drama,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(16, 20),
        endsAt: inDays(16, 22),
      },
      {
        id: SEED_IDS.sessions.kidsMatinee,
        eventId: SEED_IDS.events.kidsTheater,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(8, 11),
        endsAt: inDays(8, 12),
      },
      {
        id: SEED_IDS.sessions.kidsAfternoon,
        eventId: SEED_IDS.events.kidsTheater,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(8, 16),
        endsAt: inDays(8, 17),
      },
      {
        id: SEED_IDS.sessions.basketball,
        eventId: SEED_IDS.events.basketball,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(22, 19),
        endsAt: inDays(22, 21),
      },
      {
        id: SEED_IDS.sessions.basketballFinal,
        eventId: SEED_IDS.events.basketball,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(28, 19),
        endsAt: inDays(28, 21),
      },
      {
        id: SEED_IDS.sessions.tennis,
        eventId: SEED_IDS.events.tennis,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(23, 14),
        endsAt: inDays(23, 17),
      },
      {
        id: SEED_IDS.sessions.tennisFinal,
        eventId: SEED_IDS.events.tennis,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(24, 15),
        endsAt: inDays(24, 18),
      },
      {
        id: SEED_IDS.sessions.improvNight,
        eventId: SEED_IDS.events.improv,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(9, 21),
        endsAt: inDays(9, 23),
      },
      {
        id: SEED_IDS.sessions.improvLate,
        eventId: SEED_IDS.events.improv,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(17, 21),
        endsAt: inDays(17, 23),
      },
      {
        id: SEED_IDS.sessions.roastNight,
        eventId: SEED_IDS.events.roast,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(27, 21),
        endsAt: inDays(27, 23),
      },
      {
        id: SEED_IDS.sessions.roastLate,
        eventId: SEED_IDS.events.roast,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(29, 21),
        endsAt: inDays(29, 23),
      },
      {
        id: SEED_IDS.sessions.sambaNight,
        eventId: SEED_IDS.events.samba,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(30, 20),
        endsAt: inDays(30, 23),
      },
      {
        id: SEED_IDS.sessions.sambaLate,
        eventId: SEED_IDS.events.samba,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(31, 21),
        endsAt: inDays(32, 0),
      },
      {
        id: SEED_IDS.sessions.sambaEncore,
        eventId: SEED_IDS.events.samba,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(32, 20),
        endsAt: inDays(32, 23),
      },
      {
        id: SEED_IDS.sessions.electronicNight,
        eventId: SEED_IDS.events.electronic,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(33, 22),
        endsAt: inDays(34, 4),
      },
      {
        id: SEED_IDS.sessions.electronicLate,
        eventId: SEED_IDS.events.electronic,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(34, 22),
        endsAt: inDays(35, 4),
      },
      {
        id: SEED_IDS.sessions.electronicDawn,
        eventId: SEED_IDS.events.electronic,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(35, 22),
        endsAt: inDays(36, 4),
      },
      {
        id: SEED_IDS.sessions.indieNight,
        eventId: SEED_IDS.events.indie,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(36, 20),
        endsAt: inDays(36, 23),
      },
      {
        id: SEED_IDS.sessions.indieMatinee,
        eventId: SEED_IDS.events.indie,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(37, 16),
        endsAt: inDays(37, 19),
      },
      {
        id: SEED_IDS.sessions.indieLate,
        eventId: SEED_IDS.events.indie,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(38, 21),
        endsAt: inDays(39, 0),
      },
      {
        id: SEED_IDS.sessions.operaMatinee,
        eventId: SEED_IDS.events.opera,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(39, 15),
        endsAt: inDays(39, 18),
      },
      {
        id: SEED_IDS.sessions.operaEvening,
        eventId: SEED_IDS.events.opera,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(39, 20),
        endsAt: inDays(39, 23),
      },
      {
        id: SEED_IDS.sessions.operaGala,
        eventId: SEED_IDS.events.opera,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(40, 20),
        endsAt: inDays(40, 23),
      },
      {
        id: SEED_IDS.sessions.costumeMatinee,
        eventId: SEED_IDS.events.costumePlay,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(41, 15),
        endsAt: inDays(41, 17),
      },
      {
        id: SEED_IDS.sessions.costumeEvening,
        eventId: SEED_IDS.events.costumePlay,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(41, 20),
        endsAt: inDays(41, 22),
      },
      {
        id: SEED_IDS.sessions.costumeWeekend,
        eventId: SEED_IDS.events.costumePlay,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(42, 16),
        endsAt: inDays(42, 18),
      },
      {
        id: SEED_IDS.sessions.balletMatinee,
        eventId: SEED_IDS.events.ballet,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(43, 15),
        endsAt: inDays(43, 18),
      },
      {
        id: SEED_IDS.sessions.balletEvening,
        eventId: SEED_IDS.events.ballet,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(43, 20),
        endsAt: inDays(43, 23),
      },
      {
        id: SEED_IDS.sessions.balletGala,
        eventId: SEED_IDS.events.ballet,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(44, 20),
        endsAt: inDays(44, 23),
      },
      {
        id: SEED_IDS.sessions.volleyball,
        eventId: SEED_IDS.events.volleyball,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(45, 19),
        endsAt: inDays(45, 21),
      },
      {
        id: SEED_IDS.sessions.volleyballSemi,
        eventId: SEED_IDS.events.volleyball,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(46, 19),
        endsAt: inDays(46, 21),
      },
      {
        id: SEED_IDS.sessions.volleyballFinal,
        eventId: SEED_IDS.events.volleyball,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(47, 16),
        endsAt: inDays(47, 18),
      },
      {
        id: SEED_IDS.sessions.mma,
        eventId: SEED_IDS.events.mma,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(48, 18),
        endsAt: inDays(48, 23),
      },
      {
        id: SEED_IDS.sessions.mmaMain,
        eventId: SEED_IDS.events.mma,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(49, 18),
        endsAt: inDays(49, 23),
      },
      {
        id: SEED_IDS.sessions.mmaEncore,
        eventId: SEED_IDS.events.mma,
        venueId: SEED_IDS.venues.arena,
        startsAt: inDays(50, 18),
        endsAt: inDays(50, 23),
      },
      {
        id: SEED_IDS.sessions.womenComedyNight,
        eventId: SEED_IDS.events.womenComedy,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(51, 21),
        endsAt: inDays(51, 23),
      },
      {
        id: SEED_IDS.sessions.womenComedyLate,
        eventId: SEED_IDS.events.womenComedy,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(52, 21),
        endsAt: inDays(52, 23),
      },
      {
        id: SEED_IDS.sessions.womenComedyWeekend,
        eventId: SEED_IDS.events.womenComedy,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(53, 19),
        endsAt: inDays(53, 21),
      },
      {
        id: SEED_IDS.sessions.talkShowNight,
        eventId: SEED_IDS.events.talkShow,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(54, 21),
        endsAt: inDays(54, 23),
      },
      {
        id: SEED_IDS.sessions.talkShowLate,
        eventId: SEED_IDS.events.talkShow,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(55, 21),
        endsAt: inDays(55, 23),
      },
      {
        id: SEED_IDS.sessions.talkShowWeekend,
        eventId: SEED_IDS.events.talkShow,
        venueId: SEED_IDS.venues.teatro,
        startsAt: inDays(56, 16),
        endsAt: inDays(56, 18),
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
  console.log(`Eventos: ${Object.keys(SEED_IDS.events).length}`);
  console.log(`Sessões: ${Object.keys(SEED_IDS.sessions).length}`);
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
