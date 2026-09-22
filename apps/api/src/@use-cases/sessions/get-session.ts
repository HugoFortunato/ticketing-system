import type { SessionDetail, SessionsRepository } from "../../@repositories/sessions-repository.js"
import { SessionNotFoundError } from "../errors/session-not-found-error.js"
import { makeSessionsRepository } from "../factories/make-sessions-repository.js"

interface GetSessionUseCaseResponse {
  session: SessionDetail
}

export class GetSessionUseCase {
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute(id: string): Promise<GetSessionUseCaseResponse> {
    const session = await this.sessionsRepository.findById(id)
    if (!session) {
      throw new SessionNotFoundError()
    }
    return { session }
  }
}

export function makeGetSessionUseCase() {
  return new GetSessionUseCase(makeSessionsRepository())
}
