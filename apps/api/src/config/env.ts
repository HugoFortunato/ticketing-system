import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  HOST: process.env.HOST ?? "0.0.0.0",
  DATABASE_URL: required("DATABASE_URL"),
  REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",
  EVENTS_CACHE_ENABLED: process.env.EVENTS_CACHE_ENABLED !== "false",
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  RESERVATION_TTL_SECONDS: Number(process.env.RESERVATION_TTL_SECONDS ?? 600),
  EVENTS_CACHE_TTL_SECONDS: Number(process.env.EVENTS_CACHE_TTL_SECONDS ?? 60),
  SEARCH_ENGINE: (process.env.SEARCH_ENGINE === "elasticsearch"
    ? "elasticsearch"
    : "postgres") as "elasticsearch" | "postgres",
  SEARCH_SERVICE_URL: process.env.SEARCH_SERVICE_URL ?? "http://localhost:3001",
};
