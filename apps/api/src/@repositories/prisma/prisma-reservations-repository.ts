import { Prisma, ReservationStatus as PrismaReservationStatus } from "@prisma/client"
import { prisma } from "../../lib/prisma.js"
import { releaseExpiredReservations } from "../../lib/expiry.js"
import { ForbiddenError } from "../../@use-cases/errors/forbidden-error.js"
import { InvalidSeatSelectionError } from "../../@use-cases/errors/invalid-seat-selection-error.js"
import { ReservationNotConfirmableError } from "../../@use-cases/errors/reservation-not-confirmable-error.js"
import { ReservationNotFoundError } from "../../@use-cases/errors/reservation-not-found-error.js"
import { SeatUnavailableError } from "../../@use-cases/errors/seat-unavailable-error.js"
import { SessionNotFoundError } from "../../@use-cases/errors/session-not-found-error.js"
import type {
  CreateHoldData,
  ReservationDetail,
  ReservationStatus,
  ReservationsRepository,
} from "../reservations-repository.js"

const reservationInclude = {
  seats: {
    include: { seat: true },
  },
  session: {
    include: {
      event: true,
      venue: true,
    },
  },
  user: {
    select: { id: true, name: true, email: true },
  },
  tickets: true,
} as const

type ReservationRow = Prisma.ReservationGetPayload<{ include: typeof reservationInclude }>

function toStatus(status: PrismaReservationStatus): ReservationStatus {
  return status
}

function toDetail(row: ReservationRow): ReservationDetail {
  return {
    id: row.id,
    userId: row.userId,
    sessionId: row.sessionId,
    status: toStatus(row.status),
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    seats: row.seats.map((item) => ({
      id: item.id,
      seatId: item.seatId,
      seat: {
        id: item.seat.id,
        section: item.seat.section,
        row: item.seat.row,
        number: item.seat.number,
      },
    })),
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
    user: row.user,
    tickets: row.tickets.map((ticket) => ({
      id: ticket.id,
      reservationId: ticket.reservationId,
      sessionId: ticket.sessionId,
      seatId: ticket.seatId,
      userId: ticket.userId,
      createdAt: ticket.createdAt,
    })),
  }
}

export class PrismaReservationsRepository implements ReservationsRepository {
  async userExists(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })
    return Boolean(user)
  }

  async createHold(data: CreateHoldData): Promise<ReservationDetail> {
    try {
      const row = await prisma.$transaction(async (tx) => {
        await releaseExpiredReservations(tx, data.sessionId)

        const session = await tx.session.findUnique({ where: { id: data.sessionId } })
        if (!session) {
          throw new SessionNotFoundError()
        }

        const seats = await tx.seat.findMany({
          where: {
            id: { in: data.seatIds },
            venueId: session.venueId,
          },
        })
        if (seats.length !== data.seatIds.length) {
          throw new InvalidSeatSelectionError("One or more seats do not belong to this venue.")
        }

        return tx.reservation.create({
          data: {
            userId: data.userId,
            sessionId: data.sessionId,
            status: PrismaReservationStatus.PENDING,
            expiresAt: data.expiresAt,
            seats: {
              create: data.seatIds.map((seatId) => ({
                sessionId: data.sessionId,
                seatId,
              })),
            },
          },
          include: reservationInclude,
        })
      })

      return toDetail(row)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new SeatUnavailableError()
      }
      throw error
    }
  }

  async findById(id: string): Promise<ReservationDetail | null> {
    await prisma.$transaction((tx) => releaseExpiredReservations(tx))

    const row = await prisma.reservation.findUnique({
      where: { id },
      include: reservationInclude,
    })

    if (!row) {
      return null
    }

    return toDetail(row)
  }

  async confirmHold(id: string, userId: string): Promise<ReservationDetail> {
    try {
      const row = await prisma.$transaction(async (tx) => {
        await releaseExpiredReservations(tx)

        const reservation = await tx.reservation.findUnique({
          where: { id },
          include: { seats: true },
        })
        if (!reservation) {
          throw new ReservationNotFoundError()
        }
        if (reservation.userId !== userId) {
          throw new ForbiddenError()
        }
        if (reservation.status === PrismaReservationStatus.CONFIRMED) {
          return tx.reservation.findUniqueOrThrow({
            where: { id },
            include: reservationInclude,
          })
        }
        if (reservation.status !== PrismaReservationStatus.PENDING) {
          throw new ReservationNotConfirmableError()
        }
        if (reservation.expiresAt <= new Date()) {
          await tx.reservationSeat.deleteMany({ where: { reservationId: id } })
          await tx.reservation.update({
            where: { id },
            data: { status: PrismaReservationStatus.EXPIRED },
          })
          throw new ReservationNotConfirmableError("A reserva expirou.")
        }

        await tx.ticket.createMany({
          data: reservation.seats.map((seat) => ({
            reservationId: reservation.id,
            sessionId: reservation.sessionId,
            seatId: seat.seatId,
            userId: reservation.userId,
          })),
        })

        return tx.reservation.update({
          where: { id },
          data: { status: PrismaReservationStatus.CONFIRMED },
          include: reservationInclude,
        })
      })

      return toDetail(row)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new SeatUnavailableError()
      }
      throw error
    }
  }
}
