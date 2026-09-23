import { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

import { getUserId } from "../../lib/auth.js"
import { makeCreateReservationUseCase } from "../../@use-cases/reservations/create-reservation.js"

export async function createReservation(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    sessionId: z.string(),
  })
  const bodySchema = z.object({
    seatIds: z.array(z.string()).min(1),
  })

  const { sessionId } = paramsSchema.parse(request.params)
  const { seatIds } = bodySchema.parse(request.body)
  const userId = getUserId(request)

  const createReservationUseCase = makeCreateReservationUseCase()
  const reservation = await createReservationUseCase.execute({
    sessionId,
    userId,
    seatIds,
  })

  return reply.status(201).send(reservation)
}
