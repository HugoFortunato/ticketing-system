export type CreateSessionData = {
  eventId: string
  venueId: string
  startsAt: Date
  endsAt: Date
}

export type Session = {
  id: string
  eventId: string
  venueId: string
  startsAt: Date
  endsAt: Date
}

export type SessionEvent = {
  id: string
  name: string
  venueId: string
}

export type SessionVenue = {
  id: string
  name: string
  address: string
  city: string
}

export type SessionDetail = Session & {
  event: SessionEvent
  venue: SessionVenue
}

export interface SessionsRepository {
  create(data: CreateSessionData): Promise<Session>
  findById(id: string): Promise<SessionDetail | null>
  venueExists(id: string): Promise<boolean>
}
