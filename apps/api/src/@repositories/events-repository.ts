export type CreateEventData = {
  name: string
  description: string
  imageUrl: string
  category: string
  venueId: string
  userId?: string
}

export type Event = {
  id: string
  name: string
  description: string
  imageUrl: string
  category: string
  venueId: string
  userId: string | null
  createdAt: Date
  updatedAt: Date
}

export type EventVenue = {
  id: string
  name: string
  address: string
  city: string
}

export type EventSession = {
  id: string
  eventId: string
  venueId: string
  startsAt: Date
  endsAt: Date
}

export type EventDetail = Event & {
  venue: EventVenue
  sessions: EventSession[]
}

/** Payload da home / listagem — não é o Event completo. */
export type EventListItem = {
  id: string
  name: string
  category: string
  imageUrl: string
  venue: { name: string; city: string }
  nextSessionStartsAt: Date | null
  userId: string | null
}

export interface EventsRepository {
  create(data: CreateEventData): Promise<Event>
  findById(id: string): Promise<EventDetail | null>
  findMany(): Promise<EventListItem[]>
}
