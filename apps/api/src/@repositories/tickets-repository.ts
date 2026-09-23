export type TicketDetail = {
  id: string
  reservationId: string
  sessionId: string
  seatId: string
  userId: string
  createdAt: Date
  seat: {
    id: string
    section: string
    row: string
    number: number
  }
  user: {
    id: string
    name: string
    email: string
  }
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
  reservation: {
    id: string
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED"
    createdAt: Date
  }
}

export interface TicketsRepository {
  findById(id: string): Promise<TicketDetail | null>
}
