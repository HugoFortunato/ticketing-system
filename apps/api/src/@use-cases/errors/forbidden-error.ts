import { UseCaseError } from "./use-case-error.js"

export class ForbiddenError extends UseCaseError {
  constructor() {
    super(403, "You are not authorized to access this resource.", "FORBIDDEN")
  }
}
