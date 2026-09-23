export type SeatAvailability = "available" | "held" | "sold"

export type SessionSeat = {
  id: string
  section: string
  row: string
  number: number
  status: SeatAvailability
}

export type SeatMapEvent = {
  id: string
  name: string
  description: string
  imageUrl: string
  category: string
  venueId: string
}

export type SeatMapVenue = {
  id: string
  name: string
  address: string
  city: string
}

export type SessionSeatMap = {
  sessionId: string
  event: SeatMapEvent
  venue: SeatMapVenue
  startsAt: Date
  endsAt: Date
  seats: SessionSeat[]
}

export interface SeatsRepository {
  findMapBySessionId(sessionId: string): Promise<SessionSeatMap | null>
}
