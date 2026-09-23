import type { TicketDetail, TicketsRepository } from "../../@repositories/tickets-repository.js"
import { TicketNotFoundError } from "../errors/ticket-not-found-error.js"
import { makeTicketsRepository } from "../factories/make-tickets-repository.js"

export class GetTicketUseCase {
  constructor(private ticketsRepository: TicketsRepository) {}

  async execute(id: string): Promise<TicketDetail> {
    const ticket = await this.ticketsRepository.findById(id)
    if (!ticket) {
      throw new TicketNotFoundError()
    }
    return ticket
  }
}

export function makeGetTicketUseCase() {
  return new GetTicketUseCase(makeTicketsRepository())
}
