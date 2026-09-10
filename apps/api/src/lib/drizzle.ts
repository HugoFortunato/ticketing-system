import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "../@repositories/drizzle/schema.js"
import { env } from "../config/env.js"

let db: ReturnType<typeof drizzle<typeof schema>> | undefined

export function getDrizzle() {
  if (!db) {
    db = drizzle(postgres(env.DATABASE_URL), { schema })
  }

  return db
}
