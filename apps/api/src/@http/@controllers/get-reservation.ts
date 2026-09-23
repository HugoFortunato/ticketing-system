import { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

import { makeGetReservationUseCase } from "../../@use-cases/reservations/get-reservation.js"

export async function getReservation(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string(),
  })

  const { id } = paramsSchema.parse(request.params)

  const getReservationUseCase = makeGetReservationUseCase()
  const reservation = await getReservationUseCase.execute(id)

  return reply.status(200).send(reservation)
}
