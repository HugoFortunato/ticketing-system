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
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  RESERVATION_TTL_SECONDS: Number(process.env.RESERVATION_TTL_SECONDS ?? 600),
};
