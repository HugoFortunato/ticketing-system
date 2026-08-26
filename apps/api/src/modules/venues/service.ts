import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../lib/errors.js";

export async function listVenues() {
  return prisma.venue.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getVenue(id: string) {
  const venue = await prisma.venue.findUnique({
    where: { id },
    include: { _count: { select: { seats: true } } },
  });
  if (!venue) {
    throw new NotFoundError("Local não encontrado");
  }
  return venue;
}
