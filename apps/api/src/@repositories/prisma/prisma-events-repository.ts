import { Prisma } from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import { VenueNotFoundError } from "../../@use-cases/errors/venue-not-found-error.js"
import type {
  CreateEventData,
  Event,
  EventDetail,
  EventListItem,
  EventsRepository,
} from "../events-repository.js"

const eventInclude = {
  venue: true,
  sessions: {
    orderBy: { startsAt: "asc" as const },
  },
}

function toDomainEvent(event: {
  id: string
  name: string
  description: string
  imageUrl: string
  category: string
  venueId: string
  userId: string | null
  createdAt: Date
  updatedAt: Date
}): Event {
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    imageUrl: event.imageUrl,
    category: event.category,
    venueId: event.venueId,
    userId: event.userId,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  }
}

export class PrismaEventsRepository implements EventsRepository {
  async create(data: CreateEventData): Promise<Event> {
    try {
      const event = await prisma.event.create({
        data: {
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          category: data.category,
          userId: data.userId ?? null,
          venue: {
            connect: { id: data.venueId },
          },
        },
      })

      return toDomainEvent(event)
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        throw new VenueNotFoundError()
      }
      throw err
    }
  }

  async findMany(): Promise<EventListItem[]> {
    const rows = await prisma.event.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
        imageUrl: true,
        userId: true,
        venue: {
          select: {
            name: true,
            city: true,
          },
        },
        sessions: {
          orderBy: { startsAt: "asc" },
          take: 1,
          select: { startsAt: true },
        },
      },
    })

    return rows.map((event) => ({
      id: event.id,
      name: event.name,
      category: event.category,
      imageUrl: event.imageUrl,
      venue: { name: event.venue.name, city: event.venue.city },
      nextSessionStartsAt: event.sessions[0]?.startsAt ?? null,
      userId: event.userId,
    }))
  }

  async findById(id: string): Promise<EventDetail | null> {
    const event = await prisma.event.findUnique({
      where: { id },
      include: eventInclude,
    })

    if (!event) {
      return null
    }

    return {
      ...toDomainEvent(event),
      venue: {
        id: event.venue.id,
        name: event.venue.name,
        address: event.venue.address,
        city: event.venue.city,
      },
      sessions: event.sessions.map((session) => ({
        id: session.id,
        eventId: session.eventId,
        venueId: session.venueId,
        startsAt: session.startsAt,
        endsAt: session.endsAt,
      })),
    }
  }
}
