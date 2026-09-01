import "dotenv/config";
import { Client } from "@elastic/elasticsearch";

export const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL ?? "http://localhost:9200";
export const EVENTS_INDEX = process.env.EVENTS_INDEX ?? "events";
export const PORT = Number(process.env.PORT ?? 3001);
export const HOST = process.env.HOST ?? "0.0.0.0";
export const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";

export const elastic = new Client({ node: ELASTICSEARCH_URL });
