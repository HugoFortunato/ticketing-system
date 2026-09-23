import { UseCaseError } from "./use-case-error.js"

export class InvalidSeatSelectionError extends UseCaseError {
  constructor(message = "Invalid seat selection.") {
    super(400, message, "INVALID_SEAT_SELECTION")
  }
}
