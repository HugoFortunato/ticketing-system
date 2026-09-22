import { PrismaSearchRepository } from "../../@repositories/prisma/prisma-search-repository.js"

export function makeSearchRepository() {
  return new PrismaSearchRepository()
}
