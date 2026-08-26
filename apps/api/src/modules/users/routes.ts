import type { FastifyInstance } from "fastify";
import { listUsers } from "./service.js";

export async function userRoutes(app: FastifyInstance) {
  app.get("/users", async () => listUsers());
}
