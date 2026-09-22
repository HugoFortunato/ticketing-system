import { prisma } from "../../lib/prisma.js"
import { SearchRepository, SearchResult } from "../search-repository.js"


export class PrismaSearchRepository implements SearchRepository {
  async search(query: string): Promise<SearchResult[]> {

      const events = await prisma.event.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
        },
        include: {
          venue: true,
          sessions: true,
        },
      })

      return events.map((event) => ({
        id: event.id,
        name: event.name,
        category: event.category,
        imageUrl: event.imageUrl,
        venue: { name: event.venue.name, city: event.venue.city },
        nextSessionStartsAt: event.sessions[0]?.startsAt ?? null,
      }))
    }
}
