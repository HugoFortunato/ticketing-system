import { UseCaseError } from "./use-case-error.js"

export class EventAlreadyExistsError extends UseCaseError {
  constructor() {
    super(409, "Event already exists.", "EVENT_ALREADY_EXISTS")
  }
}
