import { prisma } from "../../lib/prisma.js";

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });
}
