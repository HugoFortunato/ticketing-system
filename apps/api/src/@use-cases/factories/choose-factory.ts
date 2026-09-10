import { env } from "../../config/env.js"

export type Orm = "prisma" | "drizzle"

type OrmAdapters<T> = Record<Orm, new () => T>

export function chooseRepository<T>(adapters: OrmAdapters<T>): T {
  const Impl = adapters[env.EVENTS_ORM]
  return new Impl()
}
