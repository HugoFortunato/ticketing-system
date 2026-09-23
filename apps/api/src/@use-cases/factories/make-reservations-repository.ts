import { PrismaReservationsRepository } from "../../@repositories/prisma/prisma-reservations-repository.js"

export function makeReservationsRepository() {
  return new PrismaReservationsRepository()
}
