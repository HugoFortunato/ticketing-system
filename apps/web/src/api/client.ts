import type { Event, EventListItem, Reservation, Seat, Session, Ticket, User } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}, userId?: string): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (userId) {
    headers.set("x-user-id", userId);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (options.signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(response.status, data.message ?? "Erro ao chamar a API");
  }
  return data as T;
}

export const api = {
  listUsers: () => request<User[]>("/users"),
  listEvents: (signal?: AbortSignal) => request<EventListItem[]>("/events", { signal }),
  searchEvents: (q: string, signal?: AbortSignal) =>
    request<EventListItem[]>(`/search?q=${encodeURIComponent(q)}`, { signal }),
  getEvent: (id: string) => request<Event>(`/events/${id}`),
  getSession: (id: string) => request<Session>(`/sessions/${id}`),
  listSeats: (sessionId: string) =>
    request<{
      sessionId: string;
      event: Event;
      venue: { id: string; name: string; city: string };
      startsAt: string;
      endsAt: string;
      seats: Seat[];
    }>(`/sessions/${sessionId}/seats`),
  createReservation: (sessionId: string, seatIds: string[], userId: string) =>
    request<Reservation>(
      `/sessions/${sessionId}/reservations`,
      { method: "POST", body: JSON.stringify({ seatIds }) },
      userId,
    ),
  getReservation: (id: string) => request<Reservation>(`/reservations/${id}`),
  cancelReservation: (id: string, userId: string) =>
    request<Reservation>(`/reservations/${id}`, { method: "DELETE" }, userId),
  confirmReservation: (id: string, userId: string) =>
    request<Reservation>(`/reservations/${id}/confirm`, { method: "POST" }, userId),
  getTicket: (id: string) => request<Ticket>(`/tickets/${id}`),
};

export { ApiError };
