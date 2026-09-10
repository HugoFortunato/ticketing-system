 export class ForbiddenError extends Error {
  constructor() {
    super('You are not authorized to access this resource.')
  }
}