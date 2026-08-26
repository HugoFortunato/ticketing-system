import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../lib/errors.js";

export async function getTicket(id: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
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
    },
  });
  if (!ticket) {
    throw new NotFoundError("Ingresso não encontrado");
  }
  return ticket;
}
