import { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

import { makeListSessionSeatsUseCase } from "../../@use-cases/seats/list-session-seats.js"

export async function listSessionSeats(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    sessionId: z.string(),
  })

  const { sessionId } = paramsSchema.parse(request.params)

  const listSessionSeatsUseCase = makeListSessionSeatsUseCase()
  const seatMap = await listSessionSeatsUseCase.execute(sessionId)

  return reply.status(200).send(seatMap)
}
