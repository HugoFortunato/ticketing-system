import { ReservationStatus } from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import { releaseExpiredReservations } from "../../lib/expiry.js"
import type {
  SeatAvailability,
  SeatsRepository,
  SessionSeatMap,
} from "../seats-repository.js"

export class PrismaSeatsRepository implements SeatsRepository {
  async findMapBySessionId(sessionId: string): Promise<SessionSeatMap | null> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { venue: true, event: true },
    })

    if (!session) {
      return null
    }

    await releaseExpiredReservations(prisma, sessionId)

    const [seats, occupied] = await Promise.all([
      prisma.seat.findMany({
        where: { venueId: session.venueId },
        orderBy: [{ row: "asc" }, { number: "asc" }],
      }),
      prisma.reservationSeat.findMany({
        where: { sessionId },
        include: {
          reservation: {
            select: { status: true },
          },
        },
      }),
    ])

    const occupancy = new Map<string, SeatAvailability>()
    for (const item of occupied) {
      occupancy.set(
        item.seatId,
        item.reservation.status === ReservationStatus.CONFIRMED ? "sold" : "held",
      )
    }

    return {
      sessionId: session.id,
      event: {
        id: session.event.id,
        name: session.event.name,
        description: session.event.description,
        imageUrl: session.event.imageUrl,
        category: session.event.category,
        venueId: session.event.venueId,
      },
      venue: {
        id: session.venue.id,
        name: session.venue.name,
        address: session.venue.address,
        city: session.venue.city,
      },
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      seats: seats.map((seat) => ({
        id: seat.id,
        section: seat.section,
        row: seat.row,
        number: seat.number,
        status: occupancy.get(seat.id) ?? "available",
      })),
    }
  }
}
