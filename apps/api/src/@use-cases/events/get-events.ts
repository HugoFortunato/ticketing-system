import {
  type EventListItem,
  type EventsRepository,
} from "../../@repositories/events-repository.js"

interface GetEventsUseCaseResponse {
  events: EventListItem[]
}

export class GetEventsUseCase {
  constructor(private eventsRepository: EventsRepository) {}

  async execute(): Promise<GetEventsUseCaseResponse> {
    const events = await this.eventsRepository.findMany()

    return {
      events,
    }
  }
}
