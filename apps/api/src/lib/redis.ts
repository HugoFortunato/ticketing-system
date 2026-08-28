import { Redis } from "ioredis";
import { env } from "../config/env.js";

export const EVENTS_LIST_CACHE_KEY = "events:list";

export const redis = env.EVENTS_CACHE_ENABLED
  ? new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
    })
  : null;

redis?.on("error", (error) => {
  console.error("Redis error:", error.message);
});

export async function readJsonCache<T>(key: string): Promise<T | null> {
  if (!redis) {
    return null;
  }
  try {
    const raw = await redis.get(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJsonCache(key: string, value: unknown, ttlSeconds: number) {
  if (!redis) {
    return;
  }
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // Cache is optional on write failure: next GET hits Postgres.
  }
}

export async function deleteCache(key: string) {
  if (!redis) {
    return;
  }
  try {
    await redis.del(key);
  } catch {
    // Ignore: TTL still expires the key.
  }
}

export async function invalidateEventsListCache() {
  await deleteCache(EVENTS_LIST_CACHE_KEY);
}
