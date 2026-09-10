import { CreateEventUseCase } from "../events/create-event.js"
import { makeEventsRepository } from "./make-events-repository.js"

export function makeCreateEventUseCase() {
  return new CreateEventUseCase(makeEventsRepository())
}
