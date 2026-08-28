import { buildApp } from "./app.js";
import { env } from "./config/env.js";

const app = await buildApp();

try {
  await app.listen({ port: env.PORT, host: env.HOST });
  app.log.info(
    { eventsCacheEnabled: env.EVENTS_CACHE_ENABLED },
    env.EVENTS_CACHE_ENABLED
      ? "GET /events usa Redis"
      : "GET /events sem Redis (Postgres em todo request)",
  );
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
