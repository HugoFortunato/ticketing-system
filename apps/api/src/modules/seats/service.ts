import { ReservationStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../lib/errors.js";
import { releaseExpiredReservations } from "../../lib/expiry.js";

export type SeatAvailability = "available" | "held" | "sold";

export async function listSessionSeats(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { venue: true, event: true },
  });
  if (!session) {
    throw new NotFoundError("Sessão não encontrada");
  }

  await releaseExpiredReservations(prisma, sessionId);

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
  ]);

  const occupancy = new Map<string, SeatAvailability>();
  for (const item of occupied) {
    occupancy.set(
      item.seatId,
      item.reservation.status === ReservationStatus.CONFIRMED ? "sold" : "held",
    );
  }

  return {
    sessionId: session.id,
    event: session.event,
    venue: session.venue,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    seats: seats.map((seat) => ({
      id: seat.id,
      section: seat.section,
      row: seat.row,
      number: seat.number,
      status: occupancy.get(seat.id) ?? "available",
    })),
  };
}
