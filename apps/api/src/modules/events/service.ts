import { prisma } from "../../lib/prisma.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import type { CreateEventBody, CreateSessionBody, UpdateEventBody } from "./schemas.js";

const eventInclude = {
  venue: true,
  sessions: {
    orderBy: { startsAt: "asc" as const },
  },
};

export async function listEvents() {
  return prisma.event.findMany({
    include: eventInclude,
    orderBy: { name: "asc" },
  });
}

export async function getEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: eventInclude,
  });
  if (!event) {
    throw new NotFoundError("Evento não encontrado");
  }
  return event;
}

export async function createEvent(body: CreateEventBody) {
  const venue = await prisma.venue.findUnique({ where: { id: body.venueId } });
  if (!venue) {
    throw new BadRequestError("Local não encontrado");
  }

  return prisma.event.create({
    data: body,
    include: eventInclude,
  });
}

export async function updateEvent(id: string, body: UpdateEventBody) {
  await getEvent(id);
  if (body.venueId) {
    const venue = await prisma.venue.findUnique({ where: { id: body.venueId } });
    if (!venue) {
      throw new BadRequestError("Local não encontrado");
    }
  }

  return prisma.event.update({
    where: { id },
    data: body,
    include: eventInclude,
  });
}

export async function deleteEvent(id: string) {
  await getEvent(id);
  await prisma.event.delete({ where: { id } });
}

export async function createSession(eventId: string, body: CreateSessionBody) {
  const event = await getEvent(eventId);
  const startsAt = new Date(body.startsAt);
  const endsAt = new Date(body.endsAt);

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw new BadRequestError("Datas inválidas");
  }
  if (endsAt <= startsAt) {
    throw new BadRequestError("endsAt deve ser posterior a startsAt");
  }

  const venueId = body.venueId ?? event.venueId;
  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue) {
    throw new BadRequestError("Local não encontrado");
  }

  return prisma.session.create({
    data: {
      eventId,
      venueId,
      startsAt,
      endsAt,
    },
    include: {
      event: true,
      venue: true,
    },
  });
}
