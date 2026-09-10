import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { getUserId } from '../../lib/auth.js'
import { makeGetEventUseCase } from '../../@use-cases/factories/make-get-event-use-case.js'
import { EventNotFoundError } from '../../@use-cases/errors/event-not-found-error.js'
import { ForbiddenError } from '../../@use-cases/errors/forbidden-error.js'

export async function getEvent(request: FastifyRequest, reply: FastifyReply) {
  const getEventParamsSchema = z.object({
    id: z.string(),
  })

  const { id } = getEventParamsSchema.parse(request.params)
  const userId = getUserId(request)


  try {
    const getEventUseCase = makeGetEventUseCase()

    const { event } = await getEventUseCase.execute({ id, userId })

    return reply.status(200).send({
      event,
    })
  } catch (err) {
    console.log(err, 'err')


    if (err instanceof ForbiddenError) {
      return reply.status(403).send({ message: err.message })
    }

    if (err instanceof EventNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
