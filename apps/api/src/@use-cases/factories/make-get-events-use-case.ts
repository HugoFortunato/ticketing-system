import { GetEventsUseCase } from "../events/get-events.js"
import { makeEventsRepository } from "./make-events-repository.js"

export function makeGetEventsUseCase() {
  return new GetEventsUseCase(makeEventsRepository())
}
