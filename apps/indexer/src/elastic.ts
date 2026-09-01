import { Client } from "@elastic/elasticsearch";
import { ELASTICSEARCH_URL, EVENTS_INDEX } from "./config.js";

export const elastic = new Client({ node: ELASTICSEARCH_URL });

export async function ensureEventsIndex() {
  const exists = await elastic.indices.exists({ index: EVENTS_INDEX });
  if (exists) {
    return;
  }
  await elastic.indices.create({
    index: EVENTS_INDEX,
    mappings: {
      properties: {
        id: { type: "keyword" },
        name: { type: "text", fields: { keyword: { type: "keyword" } } },
        description: { type: "text" },
        category: { type: "text" },
        imageUrl: { type: "keyword", index: false },
        venue: {
          properties: {
            name: { type: "text" },
            city: { type: "text" },
          },
        },
        nextSessionStartsAt: { type: "date" },
      },
    },
  });
}
