import type { Prisma, PrismaClient } from "@prisma/client";
import { ReservationStatus } from "@prisma/client";

type Db = PrismaClient | Prisma.TransactionClient;

export async function releaseExpiredReservations(db: Db, sessionId?: string) {
  const expired = await db.reservation.findMany({
    where: {
      status: ReservationStatus.PENDING,
      expiresAt: { lt: new Date() },
      ...(sessionId ? { sessionId } : {}),
    },
    select: { id: true },
  });

  if (expired.length === 0) {
    return 0;
  }

  const ids = expired.map((reservation) => reservation.id);
  await db.reservationSeat.deleteMany({
    where: { reservationId: { in: ids } },
  });
  await db.reservation.updateMany({
    where: { id: { in: ids } },
    data: { status: ReservationStatus.EXPIRED },
  });

  return ids.length;
}
