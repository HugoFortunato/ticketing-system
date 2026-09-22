import { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

import { getUserId } from "../../lib/auth.js"
import { makeGetEventUseCase } from "../../@use-cases/events/get-event.js"

export async function getEvent(request: FastifyRequest, reply: FastifyReply) {
  const getEventParamsSchema = z.object({
    id: z.string(),
  })

  const { id } = getEventParamsSchema.parse(request.params)
  const userId = getUserId(request)

  const getEventUseCase = makeGetEventUseCase()
  const { event } = await getEventUseCase.execute({ id, userId })

  return reply.status(200).send({
    event,
  })
}
