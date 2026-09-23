import { UseCaseError } from "./use-case-error.js"

export class SeatUnavailableError extends UseCaseError {
  constructor() {
    super(409, "One or more seats are no longer available.", "CONFLICT")
  }
}
