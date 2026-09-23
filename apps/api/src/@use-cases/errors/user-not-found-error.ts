import { UseCaseError } from "./use-case-error.js"

export class UserNotFoundError extends UseCaseError {
  constructor() {
    super(400, "User not found.", "USER_NOT_FOUND")
  }
}
