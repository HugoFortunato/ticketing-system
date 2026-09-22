import { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

import { makeCreateSessionUseCase } from "../../@use-cases/sessions/create-session.js"

export async function createSession(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    eventId: z.string(),
  })
  const bodySchema = z.object({
    startsAt: z.string(),
    endsAt: z.string(),
    venueId: z.string().optional(),
  })

  const { eventId } = paramsSchema.parse(request.params)
  const { startsAt, endsAt, venueId } = bodySchema.parse(request.body)

  const createSessionUseCase = makeCreateSessionUseCase()
  const { session } = await createSessionUseCase.execute({
    eventId,
    startsAt,
    endsAt,
    venueId,
  })

  return reply.status(201).send({ session })
}
