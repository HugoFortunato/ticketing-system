import { UseCaseError } from "./use-case-error.js"

export class InvalidSessionScheduleError extends UseCaseError {
  constructor(message = "endsAt must be after startsAt.") {
    super(400, message, "INVALID_SESSION_SCHEDULE")
  }
}
