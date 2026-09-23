import { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

import { getUserId } from "../../lib/auth.js"
import { makeConfirmReservationUseCase } from "../../@use-cases/reservations/confirm-reservation.js"

export async function confirmReservation(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string(),
  })

  const { id } = paramsSchema.parse(request.params)
  const userId = getUserId(request)

  const confirmReservationUseCase = makeConfirmReservationUseCase()
  const reservation = await confirmReservationUseCase.execute({ id, userId })

  return reply.status(200).send(reservation)
}
