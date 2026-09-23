import { UseCaseError } from "./use-case-error.js"

export class ReservationNotFoundError extends UseCaseError {
  constructor() {
    super(404, "Reservation not found.", "RESERVATION_NOT_FOUND")
  }
}
