import type { EventsRepository } from "../../@repositories/events-repository.js"
import type { Session, SessionsRepository } from "../../@repositories/sessions-repository.js"
import { EventNotFoundError } from "../errors/event-not-found-error.js"
import { InvalidSessionScheduleError } from "../errors/invalid-session-schedule-error.js"
import { VenueNotFoundError } from "../errors/venue-not-found-error.js"
import { makeEventsRepository } from "../factories/make-events-repository.js"
import { makeSessionsRepository } from "../factories/make-sessions-repository.js"

export type CreateSessionInput = {
  eventId: string
  startsAt: string
  endsAt: string
  venueId?: string
}

interface CreateSessionUseCaseResponse {
  session: Session
}

export class CreateSessionUseCase {
  constructor(
    private eventsRepository: EventsRepository,
    private sessionsRepository: SessionsRepository,
  ) {}

  async execute(input: CreateSessionInput): Promise<CreateSessionUseCaseResponse> {
    const event = await this.eventsRepository.findById(input.eventId)
    if (!event) {
      throw new EventNotFoundError()
    }

    const startsAt = new Date(input.startsAt)
    const endsAt = new Date(input.endsAt)
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new InvalidSessionScheduleError("Invalid dates.")
    }
    if (endsAt <= startsAt) {
      throw new InvalidSessionScheduleError()
    }

    const venueId = input.venueId ?? event.venueId
    if (!(await this.sessionsRepository.venueExists(venueId))) {
      throw new VenueNotFoundError()
    }

    const session = await this.sessionsRepository.create({
      eventId: event.id,
      venueId,
      startsAt,
      endsAt,
    })

    return { session }
  }
}

export function makeCreateSessionUseCase() {
  return new CreateSessionUseCase(makeEventsRepository(), makeSessionsRepository())
}
