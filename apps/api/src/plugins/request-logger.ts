import type { FastifyInstance } from "fastify";

export function setupRequestLogger(app: FastifyInstance) {
  app.addHook("onResponse", async (request, reply) => {
    request.log.info(
      {
        requestId: request.id,
        method: request.method,
        endpoint: request.routeOptions.url ?? request.url,
        url: request.url,
        statusCode: reply.statusCode,
        durationMs: Number(reply.elapsedTime.toFixed(2)),
      },
      "request completed",
    );
  });
}
