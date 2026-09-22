import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetSearchUseCase } from '../../@use-cases/search/get-search.js'

export async function getSearch(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getSearchParamsSchema = z.object({
    query: z.string(),
  })

  const { query } = getSearchParamsSchema.parse(request.query)

  const getSearchUseCase = makeGetSearchUseCase()

  const { events } = await getSearchUseCase.execute({
    query,
  })

  return reply.status(200).send({
    events,
  })
}
