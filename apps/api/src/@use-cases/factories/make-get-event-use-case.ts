import { GetEventUseCase } from "../events/get-event.js"
import { makeEventsRepository } from "./make-events-repository.js"

export function makeGetEventUseCase() {
  return new GetEventUseCase(makeEventsRepository())
}
