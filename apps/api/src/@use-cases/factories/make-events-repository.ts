import { DrizzleEventsRepository } from "../../@repositories/drizzle/drizzle-events-repository.js"
import { PrismaEventsRepository } from "../../@repositories/prisma/prisma-events-repository.js"
import { chooseRepository } from "./choose-factory.js"

export function makeEventsRepository() {
  return chooseRepository({
    prisma: PrismaEventsRepository,
    drizzle: DrizzleEventsRepository,
  })
}
