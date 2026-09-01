import cors from "@fastify/cors";
import Fastify from "fastify";
import { HOST, LOG_LEVEL, PORT } from "./config.js";
import { searchEvents } from "./query.js";

const app = Fastify({ logger: { level: LOG_LEVEL } });
await app.register(cors, { origin: true });

app.get("/health", async () => ({ status: "ok" }));

app.get("/search", async (request, reply) => {
  const { q } = request.query as { q?: string };
  const term = (q ?? "").trim();
  if (!term) {
    return reply.header("X-Search-Engine", "elasticsearch").send([]);
  }
  const events = await searchEvents(term);
  return reply.header("X-Search-Engine", "elasticsearch").send(events);
});

try {
  await app.listen({ port: PORT, host: HOST });
  app.log.info({ port: PORT }, "Search service (Elasticsearch)");
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
