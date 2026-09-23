import type { SeatsRepository, SessionSeatMap } from "../../@repositories/seats-repository.js"
import { SessionNotFoundError } from "../errors/session-not-found-error.js"
import { makeSeatsRepository } from "../factories/make-seats-repository.js"

export class ListSessionSeatsUseCase {
  constructor(private seatsRepository: SeatsRepository) {}

  async execute(sessionId: string): Promise<SessionSeatMap> {
    const seatMap = await this.seatsRepository.findMapBySessionId(sessionId)
    if (!seatMap) {
      throw new SessionNotFoundError()
    }
    return seatMap
  }
}

export function makeListSessionSeatsUseCase() {
  return new ListSessionSeatsUseCase(makeSeatsRepository())
}
