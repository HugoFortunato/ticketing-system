export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED"

export type ReservationUser = {
  id: string
  name: string
  email: string
}

export type ReservationSeatItem = {
  id: string
  seatId: string
  seat: {
    id: string
    section: string
    row: string
    number: number
  }
}

export type ReservationDetail = {
  id: string
  userId: string
  sessionId: string
  status: ReservationStatus
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  seats: ReservationSeatItem[]
  session: {
    id: string
    eventId: string
    venueId: string
    startsAt: Date
    endsAt: Date
    event: {
      id: string
      name: string
      description: string
      imageUrl: string
      category: string
      venueId: string
    }
    venue: {
      id: string
      name: string
      address: string
      city: string
    }
  }
  user: ReservationUser
  tickets: Array<{
    id: string
    reservationId: string
    sessionId: string
    seatId: string
    userId: string
    createdAt: Date
  }>
}

export type CreateHoldData = {
  sessionId: string
  userId: string
  seatIds: string[]
  expiresAt: Date
}

export interface ReservationsRepository {
  userExists(userId: string): Promise<boolean>
  createHold(data: CreateHoldData): Promise<ReservationDetail>
  findById(id: string): Promise<ReservationDetail | null>
  confirmHold(id: string, userId: string): Promise<ReservationDetail>
}
