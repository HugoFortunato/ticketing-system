import { relations } from "drizzle-orm"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

/** Tabelas já criadas pelo Prisma. Sem migrations Drizzle. */
export const venues = pgTable("Venue", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
})

export const events = pgTable("Event", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("imageUrl").notNull(),
  category: text("category").notNull(),
  venueId: text("venueId").notNull(),
  userId: text("userId"),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
})

export const sessions = pgTable("Session", {
  id: text("id").primaryKey(),
  eventId: text("eventId").notNull(),
  venueId: text("venueId").notNull(),
  startsAt: timestamp("startsAt", { precision: 3, mode: "date" }).notNull(),
  endsAt: timestamp("endsAt", { precision: 3, mode: "date" }).notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
})

export const eventsRelations = relations(events, ({ one, many }) => ({
  venue: one(venues, {
    fields: [events.venueId],
    references: [venues.id],
  }),
  sessions: many(sessions),
}))

export const venuesRelations = relations(venues, ({ many }) => ({
  events: many(events),
  sessions: many(sessions),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  event: one(events, {
    fields: [sessions.eventId],
    references: [events.id],
  }),
  venue: one(venues, {
    fields: [sessions.venueId],
    references: [venues.id],
  }),
}))
