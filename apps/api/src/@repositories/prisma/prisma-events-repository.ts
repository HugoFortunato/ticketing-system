import { prisma } from "../../lib/prisma.js"
import type { CreateEventData, Event, EventsRepository } from "../events-repository.js"

export class PrismaEventsRepository implements EventsRepository {
  async create(data: CreateEventData): Promise<Event> {
    const event = await prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        category: data.category,
        venue: {
          connect: { id: data.venueId },
        },
      },
    })

    return {
      id: event.id,
      name: event.name,
      description: event.description,
      imageUrl: event.imageUrl,
      category: event.category,
      venueId: event.venueId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }
  }
}
