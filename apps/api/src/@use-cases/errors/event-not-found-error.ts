import { UseCaseError } from "./use-case-error.js"

export class EventNotFoundError extends UseCaseError {
  constructor() {
    super(404, "Event not found.", "EVENT_NOT_FOUND")
  }
}
