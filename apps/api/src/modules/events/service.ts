import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import {
  EVENTS_LIST_CACHE_KEY,
  eventDetailCacheKey,
  invalidateEventReadCaches,
  readJsonCache,
  writeJsonCache,
} from "../../lib/redis.js";
import type { CreateEventBody, CreateSessionBody, UpdateEventBody } from "./schemas.js";

const eventInclude = {
  venue: true,
  sessions: {
    orderBy: { startsAt: "asc" as const },
  },
};

export const eventListSelect = {
  id: true,
  name: true,
  category: true,
  imageUrl: true,
  venue: {
    select: {
      name: true,
      city: true,
    },
  },
  sessions: {
    orderBy: { startsAt: "asc" as const },
    take: 1,
    select: { startsAt: true },
  },
} as const;

export type EventListItem = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  venue: { name: string; city: string };
  nextSessionStartsAt: string | null;
};

export type EventListResult = {
  events: EventListItem[];
  cache: "HIT" | "MISS" | "OFF";
};

export function toListItem(event: {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  venue: { name: string; city: string };
  sessions: { startsAt: Date }[];
}): EventListItem {
  const next = event.sessions[0]?.startsAt;
  return {
    id: event.id,
    name: event.name,
    category: event.category,
    imageUrl: event.imageUrl,
    venue: { name: event.venue.name, city: event.venue.city },
    nextSessionStartsAt: next ? next.toISOString() : null,
  };
}

export async function listEvents(): Promise<EventListResult> {
  if (env.EVENTS_CACHE_ENABLED) {
    const cached = await readJsonCache<EventListItem[]>(EVENTS_LIST_CACHE_KEY);
    if (cached) {
      return { events: cached, cache: "HIT" };
    }
  }

  const rows = await prisma.event.findMany({
    select: eventListSelect,
    orderBy: { name: "asc" },
  });
  const events = rows.map(toListItem);

  if (env.EVENTS_CACHE_ENABLED) {
    await writeJsonCache(EVENTS_LIST_CACHE_KEY, events, env.EVENTS_CACHE_TTL_SECONDS);
    return { events, cache: "MISS" };
  }

  return { events, cache: "OFF" };
}

export type EventDetailResult = {
  event: unknown;
  cache: "HIT" | "MISS" | "OFF";
};

export async function getEvent(id: string) {
  const { event } = await getEventWithCache(id);
  return event as {
    id: string;
    venueId: string;
    venue: unknown;
    sessions: unknown[];
  };
}

export async function getEventWithCache(id: string): Promise<EventDetailResult> {
  const cacheKey = eventDetailCacheKey(id);

  if (env.EVENTS_CACHE_ENABLED) {
    const cached = await readJsonCache<unknown>(cacheKey);
    if (cached) {
      return { event: cached, cache: "HIT" };
    }
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: eventInclude,
  });
  if (!event) {
    throw new NotFoundError("Evento não encontrado");
  }

  if (env.EVENTS_CACHE_ENABLED) {
    await writeJsonCache(cacheKey, event, env.EVENTS_CACHE_TTL_SECONDS);
    return { event, cache: "MISS" };
  }

  return { event, cache: "OFF" };
}

export async function createEvent(body: CreateEventBody) {
  const venue = await prisma.venue.findUnique({ where: { id: body.venueId } });
  if (!venue) {
    throw new BadRequestError("Local não encontrado");
  }

  const created = await prisma.event.create({
    data: body,
    include: eventInclude,
  });
  await invalidateEventReadCaches();
  return created;
}

export async function updateEvent(id: string, body: UpdateEventBody) {
  await getEvent(id);
  if (body.venueId) {
    const venue = await prisma.venue.findUnique({ where: { id: body.venueId } });
    if (!venue) {
      throw new BadRequestError("Local não encontrado");
    }
  }

  const updated = await prisma.event.update({
    where: { id },
    data: body,
    include: eventInclude,
  });
  await invalidateEventReadCaches(id);
  return updated;
}

export async function deleteEvent(id: string) {
  await getEvent(id);
  await prisma.event.delete({ where: { id } });
  await invalidateEventReadCaches(id);
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

  const session = await prisma.session.create({
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
  await invalidateEventReadCaches(eventId);
  return session;
}
