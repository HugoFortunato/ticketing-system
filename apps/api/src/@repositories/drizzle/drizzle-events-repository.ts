import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { getDrizzle } from "../../lib/drizzle.js"
import type {
  CreateEventData,
  Event,
  EventDetail,
  EventListItem,
  EventsRepository,
} from "../events-repository.js"
import { events } from "./schema.js"

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

export class DrizzleEventsRepository implements EventsRepository {
  async create(data: CreateEventData): Promise<Event> {
    const now = new Date()
    const [event] = await getDrizzle()
      .insert(events)
      .values({
        id: randomUUID(),
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        category: data.category,
        venueId: data.venueId,
        userId: data.userId ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    if (!event) {
      throw new Error("Failed to create event")
    }

    return toDomainEvent(event)
  }

  async findMany(): Promise<EventListItem[]> {
    const eventList = await getDrizzle().query.events.findMany({
      orderBy: (event, { asc }) => [asc(event.name)],
      with: {
        venue: true,
        sessions: {
          orderBy: (session, { asc }) => [asc(session.startsAt)],
        },
      },
    })

    return eventList.map((event) => ({
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
    const event = await getDrizzle().query.events.findFirst({
      where: eq(events.id, id),
      with: {
        venue: true,
        sessions: {
          orderBy: (session, { asc }) => [asc(session.startsAt)],
        },
      },
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
