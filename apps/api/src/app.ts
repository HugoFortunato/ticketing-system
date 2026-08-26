import type { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { setupErrorHandler } from "./plugins/error-handler.js";
import { setupRequestLogger } from "./plugins/request-logger.js";
import { eventRoutes } from "./modules/events/routes.js";
import { reservationRoutes } from "./modules/reservations/routes.js";
import { seatRoutes } from "./modules/seats/routes.js";
import { sessionRoutes } from "./modules/sessions/routes.js";
import { ticketRoutes } from "./modules/tickets/routes.js";
import { userRoutes } from "./modules/users/routes.js";
import { venueRoutes } from "./modules/venues/routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
  });

  await app.register(cors, { origin: true });
  setupErrorHandler(app);
  setupRequestLogger(app);

  app.get("/health", async () => ({ status: "ok" }));

  await app.register(userRoutes);
  await app.register(venueRoutes);
  await app.register(eventRoutes);
  await app.register(sessionRoutes);
  await app.register(seatRoutes);
  await app.register(reservationRoutes);
  await app.register(ticketRoutes);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}

export type AppInstance = FastifyInstance;
