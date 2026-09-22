import { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

import { makeGetSessionUseCase } from "../../@use-cases/sessions/get-session.js"

export async function getSession(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string(),
  })

  const { id } = paramsSchema.parse(request.params)

  const getSessionUseCase = makeGetSessionUseCase()
  const { session } = await getSessionUseCase.execute(id)

  return reply.status(200).send({ session })
}
