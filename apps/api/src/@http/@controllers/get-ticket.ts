import { FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"

import { makeGetTicketUseCase } from "../../@use-cases/tickets/get-ticket.js"

export async function getTicket(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string(),
  })

  const { id } = paramsSchema.parse(request.params)

  const getTicketUseCase = makeGetTicketUseCase()
  const ticket = await getTicketUseCase.execute(id)

  return reply.status(200).send(ticket)
}
