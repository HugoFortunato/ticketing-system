import type {
  SearchRepository,
  SearchResult,
} from "../../@repositories/search-repository.js"
import { makeSearchRepository } from "../factories/make-search-repository.js"

interface GetSearchUseCaseRequest {
  query: string
}

interface GetSearchUseCaseResponse {
  events: SearchResult[]
}

export class GetSearchUseCase {
  constructor(private searchRepository: SearchRepository) {}

  async execute({ query }: GetSearchUseCaseRequest): Promise<GetSearchUseCaseResponse> {
    const events = await this.searchRepository.search(query)

    return {
      events,
    }
  }
}

export function makeGetSearchUseCase() {
  return new GetSearchUseCase(makeSearchRepository())
}
