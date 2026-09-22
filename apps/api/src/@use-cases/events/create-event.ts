import {
  type CreateEventData,
  type Event,
  type EventsRepository,
} from "../../@repositories/events-repository.js"
import { makeEventsRepository } from "../factories/make-events-repository.js"

/** Mock até auth real no create — seed/demo. */
export const MOCK_AUTHOR_USER_ID = "11111111-1111-4111-a111-111111111111"

interface CreateEventUseCaseResponse {
  event: Event
}

export class CreateEventUseCase {
  constructor(private eventsRepository: EventsRepository) {}

  async execute(data: CreateEventData): Promise<CreateEventUseCaseResponse> {
    const event = await this.eventsRepository.create({
      ...data,
      userId: MOCK_AUTHOR_USER_ID,
    })

    return {
      event,
    }
  }
}

export function makeCreateEventUseCase() {
  return new CreateEventUseCase(makeEventsRepository())
}
