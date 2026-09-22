import { UseCaseError } from "./use-case-error.js"

export class VenueNotFoundError extends UseCaseError {
  constructor() {
    super(404, "Venue not found.", "VENUE_NOT_FOUND")
  }
}
