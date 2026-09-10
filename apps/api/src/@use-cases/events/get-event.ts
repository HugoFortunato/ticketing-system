import {
  type EventDetail,
  type EventsRepository,
} from "../../@repositories/events-repository.js"
import { EventNotFoundError } from "../errors/event-not-found-error.js"
import { ForbiddenError } from "../errors/forbidden-error.js"

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


    if (event?.userId !== userId) {
      throw new ForbiddenError()
    }

  
    return {
      event,
    }
  }
}
