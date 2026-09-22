import { UseCaseError } from "./use-case-error.js"

export class SessionNotFoundError extends UseCaseError {
  constructor() {
    super(404, "Session not found.", "SESSION_NOT_FOUND")
  }
}
