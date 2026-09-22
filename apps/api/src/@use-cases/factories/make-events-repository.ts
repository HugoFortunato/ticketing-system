import { PrismaEventsRepository } from "../../@repositories/prisma/prisma-events-repository.js"

export function makeEventsRepository() {
  return new PrismaEventsRepository()
}
