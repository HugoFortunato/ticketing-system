import { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

import { makeCreateEventUseCase } from "../../@use-cases/events/create-event.js"

export async function createEvent(request: FastifyRequest, reply: FastifyReply) {
  const createEventBodySchema = z.object({
    name: z.string(),
    description: z.string(),
    imageUrl: z.string(),
    category: z.string(),
    venueId: z.string(),
  })

  const { name, description, imageUrl, category, venueId } =
    createEventBodySchema.parse(request.body)

  const createEventUseCase = makeCreateEventUseCase()

  const { event } = await createEventUseCase.execute({
    name,
    description,
    imageUrl,
    category,
    venueId,
  })

  return reply.status(201).send({
    event,
  })
}
