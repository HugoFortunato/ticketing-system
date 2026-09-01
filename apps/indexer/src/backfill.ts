import { ensureEventsIndex } from "./elastic.js";
import { indexEvent, prisma } from "./documents.js";

await ensureEventsIndex();
const events = await prisma.event.findMany({ select: { id: true } });
for (const event of events) {
  await indexEvent(event.id);
}
console.log(`Backfill: ${events.length} eventos no Elasticsearch`);
await prisma.$disconnect();
