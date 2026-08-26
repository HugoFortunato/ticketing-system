import { Prisma, ReservationStatus } from "@prisma/client";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../lib/errors.js";
import { releaseExpiredReservations } from "../../lib/expiry.js";
import type { CreateReservationBody } from "./schemas.js";

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
};

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createReservation(
  sessionId: string,
  userId: string,
  body: CreateReservationBody,
) {
  const seatIds = [...new Set(body.seatIds)];
  if (seatIds.length === 0) {
    throw new BadRequestError("Selecione pelo menos um assento");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new BadRequestError("Usuário não encontrado");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      await releaseExpiredReservations(tx, sessionId);

      const session = await tx.session.findUnique({ where: { id: sessionId } });
      if (!session) {
        throw new NotFoundError("Sessão não encontrada");
      }

      const seats = await tx.seat.findMany({
        where: {
          id: { in: seatIds },
          venueId: session.venueId,
        },
      });
      if (seats.length !== seatIds.length) {
        throw new BadRequestError("Um ou mais assentos não pertencem a este local");
      }

      const expiresAt = new Date(Date.now() + env.RESERVATION_TTL_SECONDS * 1000);

      return tx.reservation.create({
        data: {
          userId,
          sessionId,
          status: ReservationStatus.PENDING,
          expiresAt,
          seats: {
            create: seatIds.map((seatId) => ({
              sessionId,
              seatId,
            })),
          },
        },
        include: reservationInclude,
      });
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("Um ou mais assentos já não estão disponíveis");
    }
    throw error;
  }
}

export async function getReservation(id: string) {
  await prisma.$transaction((tx) => releaseExpiredReservations(tx));

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: reservationInclude,
  });
  if (!reservation) {
    throw new NotFoundError("Reserva não encontrada");
  }
  return reservation;
}

export async function cancelReservation(id: string, userId: string) {
  const reservation = await getReservation(id);
  if (reservation.userId !== userId) {
    throw new BadRequestError("A reserva pertence a outro usuário");
  }
  if (reservation.status !== ReservationStatus.PENDING) {
    throw new ConflictError("Somente reservas pendentes podem ser canceladas");
  }

  await prisma.$transaction([
    prisma.reservationSeat.deleteMany({ where: { reservationId: id } }),
    prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
    }),
  ]);

  return getReservation(id);
}

export async function confirmReservation(id: string, userId: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      await releaseExpiredReservations(tx);

      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: { seats: true },
      });
      if (!reservation) {
        throw new NotFoundError("Reserva não encontrada");
      }
      if (reservation.userId !== userId) {
        throw new BadRequestError("A reserva pertence a outro usuário");
      }
      if (reservation.status === ReservationStatus.CONFIRMED) {
        return tx.reservation.findUniqueOrThrow({
          where: { id },
          include: reservationInclude,
        });
      }
      if (reservation.status !== ReservationStatus.PENDING) {
        throw new ConflictError("Somente reservas pendentes podem ser confirmadas");
      }
      if (reservation.expiresAt <= new Date()) {
        await tx.reservationSeat.deleteMany({ where: { reservationId: id } });
        await tx.reservation.update({
          where: { id },
          data: { status: ReservationStatus.EXPIRED },
        });
        throw new ConflictError("A reserva expirou");
      }

      await tx.ticket.createMany({
        data: reservation.seats.map((seat) => ({
          reservationId: reservation.id,
          sessionId: reservation.sessionId,
          seatId: seat.seatId,
          userId: reservation.userId,
        })),
      });

      return tx.reservation.update({
        where: { id },
        data: { status: ReservationStatus.CONFIRMED },
        include: reservationInclude,
      });
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("Ticket já emitido para um dos assentos");
    }
    throw error;
  }
}
