import { PrismaTicketsRepository } from "../../@repositories/prisma/prisma-tickets-repository.js"

export function makeTicketsRepository() {
  return new PrismaTicketsRepository()
}
