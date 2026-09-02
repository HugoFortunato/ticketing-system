export class EventAlreadyExistsError extends Error {
    constructor() {
      super('Event already exists.')
    }
  }
  