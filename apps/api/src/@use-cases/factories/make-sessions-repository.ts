import { PrismaSessionsRepository } from "../../@repositories/prisma/prisma-sessions-repository.js"

export function makeSessionsRepository() {
  return new PrismaSessionsRepository()
}
