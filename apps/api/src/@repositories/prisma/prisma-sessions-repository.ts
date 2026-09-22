import { Prisma } from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import { VenueNotFoundError } from "../../@use-cases/errors/venue-not-found-error.js"
import type {
  CreateSessionData,
  Session,
  SessionDetail,
  SessionsRepository,
} from "../sessions-repository.js"

function toSession(row: {
  id: string
  eventId: string
  venueId: string
  startsAt: Date
  endsAt: Date
}): Session {
  return {
    id: row.id,
    eventId: row.eventId,
    venueId: row.venueId,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
  }
}

export class PrismaSessionsRepository implements SessionsRepository {
  async create(data: CreateSessionData): Promise<Session> {
    try {
      const row = await prisma.session.create({
        data: {
          eventId: data.eventId,
          venueId: data.venueId,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
        },
      })
      return toSession(row)
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        throw new VenueNotFoundError()
      }
      throw err
    }
  }

  async findById(id: string): Promise<SessionDetail | null> {
    const row = await prisma.session.findUnique({
      where: { id },
      include: {
        event: true,
        venue: true,
      },
    })

    if (!row) {
      return null
    }

    return {
      ...toSession(row),
      event: {
        id: row.event.id,
        name: row.event.name,
        venueId: row.event.venueId,
      },
      venue: {
        id: row.venue.id,
        name: row.venue.name,
        address: row.venue.address,
        city: row.venue.city,
      },
    }
  }

  async venueExists(id: string): Promise<boolean> {
    const venue = await prisma.venue.findUnique({
      where: { id },
      select: { id: true },
    })
    return Boolean(venue)
  }
}
