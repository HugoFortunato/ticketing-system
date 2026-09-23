import { UseCaseError } from "./use-case-error.js"

export class ReservationNotConfirmableError extends UseCaseError {
  constructor(message = "Somente reservas pendentes podem ser confirmadas.") {
    super(409, message, "CONFLICT")
  }
}
