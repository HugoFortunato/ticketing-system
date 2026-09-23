import { PrismaSeatsRepository } from "../../@repositories/prisma/prisma-seats-repository.js"

export function makeSeatsRepository() {
  return new PrismaSeatsRepository()
}
