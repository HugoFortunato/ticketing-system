import { PrismaClient } from "@prisma/client";
import { EVENTS_INDEX } from "./config.js";
import { elastic } from "./elastic.js";

export const prisma = new PrismaClient();

export type EventDocument = {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  venue: { name: string; city: string };
  nextSessionStartsAt: string | null;
};

export async function loadEventDocument(eventId: string): Promise<EventDocument | null> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      imageUrl: true,
      venue: { select: { name: true, city: true } },
      sessions: {
        orderBy: { startsAt: "asc" },
        take: 1,
        select: { startsAt: true },
      },
    },
  });
  if (!event) {
    return null;
  }
  const next = event.sessions[0]?.startsAt;
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    category: event.category,
    imageUrl: event.imageUrl,
    venue: { name: event.venue.name, city: event.venue.city },
    nextSessionStartsAt: next ? next.toISOString() : null,
  };
}

export async function indexEvent(eventId: string) {
  const document = await loadEventDocument(eventId);
  if (!document) {
    await elastic.delete({ index: EVENTS_INDEX, id: eventId }, { ignore: [404] });
    return;
  }
  await elastic.index({
    index: EVENTS_INDEX,
    id: eventId,
    document,
    refresh: false,
  });
}

export async function deleteEvent(eventId: string) {
  await elastic.delete({ index: EVENTS_INDEX, id: eventId }, { ignore: [404] });
}

export async function reindexVenueEvents(venueId: string) {
  const events = await prisma.event.findMany({
    where: { venueId },
    select: { id: true },
  });
  for (const event of events) {
    await indexEvent(event.id);
  }
}
