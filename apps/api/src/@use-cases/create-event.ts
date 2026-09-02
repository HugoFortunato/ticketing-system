import {
  type CreateEventData,
  type Event,
  type EventsRepository,
} from "../@repositories/events-repository.js"

interface CreateEventUseCaseResponse {
  event: Event
}

export class CreateEventUseCase {
  constructor(private eventsRepository: EventsRepository) {}

  async execute(data: CreateEventData): Promise<CreateEventUseCaseResponse> {
    const event = await this.eventsRepository.create(data)

    return {
      event,
    }
  }
}
