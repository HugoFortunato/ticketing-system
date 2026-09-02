export type CreateEventData = {
  name: string
  description: string
  imageUrl: string
  category: string
  venueId: string
}

export type Event = {
  id: string
  name: string
  description: string
  imageUrl: string
  category: string
  venueId: string
  createdAt: Date
  updatedAt: Date
}

export interface EventsRepository {
  create(data: CreateEventData): Promise<Event>
}
