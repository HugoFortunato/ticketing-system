import { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetEventsUseCase } from '../../@use-cases/events/get-events.js'

export async function getEvents(_request: FastifyRequest, reply: FastifyReply) {
  const getEventsUseCase = makeGetEventsUseCase()

  const { events } = await getEventsUseCase.execute()

  return reply.status(200).send({
    events,
  })
}
