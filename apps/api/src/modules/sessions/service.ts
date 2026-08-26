import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../lib/errors.js";

export async function getSession(id: string) {
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      event: true,
      venue: true,
    },
  });
  if (!session) {
    throw new NotFoundError("Sessão não encontrada");
  }
  return session;
}
