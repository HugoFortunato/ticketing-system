import {
  type CreateEventData,
  type Event,
  type EventsRepository,
} from "../../@repositories/events-repository.js"

/** Mock até auth real no create — seed/demo. */
export const MOCK_AUTHOR_USER_ID = "1111111"

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
