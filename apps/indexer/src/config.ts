import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(here, "../../api/.env") });
config();

export const DATABASE_URL = process.env.DATABASE_URL;
export const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL ?? "http://localhost:9200";
export const EVENTS_INDEX = process.env.EVENTS_INDEX ?? "events";
export const KAFKA_BROKERS = (process.env.KAFKA_BROKERS ?? "localhost:29092").split(",");
export const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID ?? "ticketing-indexer";
export const KAFKA_TOPIC_PREFIX = process.env.KAFKA_TOPIC_PREFIX ?? "ticketing";
