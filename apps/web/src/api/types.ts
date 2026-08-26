export type User = {
  id: string;
  name: string;
  email: string;
};

export type Venue = {
  id: string;
  name: string;
  address: string;
  city: string;
};

export type Session = {
  id: string;
  eventId: string;
  venueId: string;
  startsAt: string;
  endsAt: string;
  venue?: Venue;
  event?: Event;
};

export type Event = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  venueId: string;
  venue: Venue;
  sessions: Session[];
};

export type SeatStatus = "available" | "held" | "sold";

export type Seat = {
  id: string;
  section: string;
  row: string;
  number: number;
  status: SeatStatus;
};

export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

export type ReservationSeat = {
  id: string;
  seatId: string;
  seat: Omit<Seat, "status">;
};

export type Ticket = {
  id: string;
  reservationId: string;
  sessionId: string;
  seatId: string;
  userId: string;
  createdAt: string;
  seat?: Omit<Seat, "status">;
  session?: Session & { event: Event; venue: Venue };
  user?: User;
};

export type Reservation = {
  id: string;
  userId: string;
  sessionId: string;
  status: ReservationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  seats: ReservationSeat[];
  session: Session & { event: Event; venue: Venue };
  user: User;
  tickets: Ticket[];
};
