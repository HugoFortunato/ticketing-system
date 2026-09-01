import { Kafka, logLevel } from "kafkajs";
import { KAFKA_BROKERS, KAFKA_GROUP_ID, KAFKA_TOPIC_PREFIX } from "./config.js";
import { deleteEvent, indexEvent, prisma, reindexVenueEvents } from "./documents.js";
import { ensureEventsIndex } from "./elastic.js";

const kafka = new Kafka({
  clientId: "ticketing-indexer",
  brokers: KAFKA_BROKERS,
  logLevel: logLevel.ERROR,
});

const consumer = kafka.consumer({ groupId: KAFKA_GROUP_ID });

type DebeziumEnvelope = {
  payload?: {
    op?: string;
    after?: Record<string, string | null> | null;
    before?: Record<string, string | null> | null;
    source?: { table?: string };
  };
};

function parseEnvelope(raw: Buffer | string | null): DebeziumEnvelope["payload"] | null {
  if (!raw) {
    return null;
  }
  const text = Buffer.isBuffer(raw) ? raw.toString("utf8") : raw;
  const parsed = JSON.parse(text) as DebeziumEnvelope;
  return parsed.payload ?? (parsed as DebeziumEnvelope["payload"]);
}

async function handleChange(topic: string, payload: NonNullable<DebeziumEnvelope["payload"]>) {
  const table = payload.source?.table ?? topic.split(".").at(-1);
  const op = payload.op;
  const after = payload.after;
  const before = payload.before;

  if (table === "Event") {
    const id = after?.id ?? before?.id;
    if (!id) {
      return;
    }
    if (op === "d") {
      await deleteEvent(id);
      return;
    }
    await indexEvent(id);
    return;
  }

  if (table === "Venue") {
    const venueId = after?.id ?? before?.id;
    if (!venueId || op === "d") {
      return;
    }
    await reindexVenueEvents(venueId);
    return;
  }

  if (table === "Session") {
    const eventId = after?.eventId ?? before?.eventId;
    if (!eventId) {
      return;
    }
    await indexEvent(eventId);
  }
}

await ensureEventsIndex();
await consumer.connect();

const topics = [
  `${KAFKA_TOPIC_PREFIX}.public.Event`,
  `${KAFKA_TOPIC_PREFIX}.public.Venue`,
  `${KAFKA_TOPIC_PREFIX}.public.Session`,
];

let subscribed = false;
for (let attempt = 1; attempt <= 30; attempt += 1) {
  try {
    await consumer.subscribe({ topics, fromBeginning: true });
    subscribed = true;
    break;
  } catch (error) {
    console.warn(`Tópicos CDC ainda não existem (tentativa ${attempt}/30)`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
if (!subscribed) {
  throw new Error("Tópicos Debezium não apareceram. Corre pnpm search:register-debezium.");
}

console.log("Indexer a consumir CDC (Debezium → Elasticsearch)");

await consumer.run({
  eachMessage: async ({ topic, message }) => {
    try {
      const payload = parseEnvelope(message.value);
      if (!payload) {
        return;
      }
      await handleChange(topic, payload);
    } catch (error) {
      console.error("Falha a indexar mensagem CDC:", error);
    }
  },
});

async function shutdown() {
  await consumer.disconnect();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});
