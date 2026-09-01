import { elastic, EVENTS_INDEX } from "./config.js";

export type EventListItem = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  venue: { name: string; city: string };
  nextSessionStartsAt: string | null;
};

export async function searchEvents(q: string): Promise<EventListItem[]> {
  const response = await elastic.search<EventListItem>({
    index: EVENTS_INDEX,
    size: 50,
    query: {
      bool: {
        should: [
          {
            multi_match: {
              query: q,
              type: "best_fields",
              fields: ["name^3", "description", "category", "venue.name", "venue.city"],
              fuzziness: "AUTO",
            },
          },
          { match_phrase_prefix: { name: { query: q, boost: 4 } } },
        ],
        minimum_should_match: 1,
      },
    },
  });

  return response.hits.hits
    .map((hit) => hit._source)
    .filter((source): source is EventListItem => Boolean(source));
}
