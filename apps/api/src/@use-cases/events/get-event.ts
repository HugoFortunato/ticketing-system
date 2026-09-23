import {
  type EventDetail,
  type EventsRepository,
} from "../../@repositories/events-repository.js"
import { EventNotFoundError } from "../errors/event-not-found-error.js"
import { ForbiddenError } from "../errors/forbidden-error.js"
import { makeEventsRepository } from "../factories/make-events-repository.js"

interface GetEventUseCaseRequest {
  id: string
  userId: string
}

interface GetEventUseCaseResponse {
  event: EventDetail
}

export class GetEventUseCase {
  constructor(private eventsRepository: EventsRepository) {}

  async execute({ id, userId }: GetEventUseCaseRequest): Promise<GetEventUseCaseResponse> {
    const event = await this.eventsRepository.findById(id)

    if (!event) {
      throw new EventNotFoundError()
    }

   

    return {
      event,
    }
  }
}

export function makeGetEventUseCase() {
  return new GetEventUseCase(makeEventsRepository())
}
