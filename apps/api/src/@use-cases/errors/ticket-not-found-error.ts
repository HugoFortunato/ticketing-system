import { UseCaseError } from "./use-case-error.js"

export class TicketNotFoundError extends UseCaseError {
  constructor() {
    super(404, "Ticket not found.", "TICKET_NOT_FOUND")
  }
}
