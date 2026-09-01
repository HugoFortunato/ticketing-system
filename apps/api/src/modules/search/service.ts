import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { eventListSelect, toListItem, type EventListItem } from "../events/service.js";

export type SearchResult = {
  events: EventListItem[];
  engine: "postgres" | "elasticsearch";
};

const MAX_QUERY_LENGTH = 200;

export function normalizeSearchQuery(raw: string | undefined): string {
  if (!raw) {
    return "";
  }
  return raw.trim().replace(/[%_]/g, "").slice(0, MAX_QUERY_LENGTH);
}

export async function searchEvents(rawQuery: string | undefined): Promise<SearchResult> {
  const q = normalizeSearchQuery(rawQuery);
  const engine = env.SEARCH_ENGINE;

  if (!q) {
    return { events: [], engine };
  }

  if (engine === "elasticsearch") {
    return { events: await searchViaSearchService(q), engine };
  }

  return { events: await searchViaPostgres(q), engine };
}

async function searchViaPostgres(q: string): Promise<EventListItem[]> {
  const rows = await prisma.event.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { venue: { name: { contains: q, mode: "insensitive" } } },
        { venue: { city: { contains: q, mode: "insensitive" } } },
      ],
    },
    select: eventListSelect,
    orderBy: { name: "asc" },
  });
  return rows.map(toListItem);
}

async function searchViaSearchService(q: string): Promise<EventListItem[]> {
  const url = new URL("/search", env.SEARCH_SERVICE_URL);
  url.searchParams.set("q", q);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) {
    throw new Error(`Search service ${response.status}`);
  }
  const body = (await response.json()) as EventListItem[];
  if (!Array.isArray(body)) {
    throw new Error("Search service devolveu um corpo inválido");
  }
  return body;
}
