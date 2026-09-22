export type SearchResult = {
  id: string
  name: string
  category: string
  imageUrl: string
  venue: { name: string; city: string }
  nextSessionStartsAt: Date | null
}

export interface SearchRepository {
  search(query: string): Promise<SearchResult[]>
}