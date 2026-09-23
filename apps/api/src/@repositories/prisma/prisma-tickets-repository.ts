import { Prisma } from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import type { TicketDetail, TicketsRepository } from "../tickets-repository.js"

const ticketInclude = {
  seat: true,
  user: {
    select: { id: true, name: true, email: true },
  },
  session: {
    include: {
      event: true,
      venue: true,
    },
  },
  reservation: {
    select: { id: true, status: true, createdAt: true },
  },
} as const

type TicketRow = Prisma.TicketGetPayload<{ include: typeof ticketInclude }>

function toDetail(row: TicketRow): TicketDetail {
  return {
    id: row.id,
    reservationId: row.reservationId,
    sessionId: row.sessionId,
    seatId: row.seatId,
    userId: row.userId,
    createdAt: row.createdAt,
    seat: {
      id: row.seat.id,
      section: row.seat.section,
      row: row.seat.row,
      number: row.seat.number,
    },
    user: row.user,
    session: {
      id: row.session.id,
      eventId: row.session.eventId,
      venueId: row.session.venueId,
      startsAt: row.session.startsAt,
      endsAt: row.session.endsAt,
      event: {
        id: row.session.event.id,
        name: row.session.event.name,
        description: row.session.event.description,
        imageUrl: row.session.event.imageUrl,
        category: row.session.event.category,
        venueId: row.session.event.venueId,
      },
      venue: {
        id: row.session.venue.id,
        name: row.session.venue.name,
        address: row.session.venue.address,
        city: row.session.venue.city,
      },
    },
    reservation: {
      id: row.reservation.id,
      status: row.reservation.status,
      createdAt: row.reservation.createdAt,
    },
  }
}

export class PrismaTicketsRepository implements TicketsRepository {
  async findById(id: string): Promise<TicketDetail | null> {
    const row = await prisma.ticket.findUnique({
      where: { id },
      include: ticketInclude,
    })

    if (!row) {
      return null
    }

    return toDetail(row)
  }
}
