import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Ticket } from "../api/types";
import { formatDateTime, seatLabel } from "../lib/format";

export function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getTicket(id)
      .then(setTicket)
      .catch((err: Error) => setError(err.message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!ticket || !ticket.session || !ticket.seat) return <p>Carregando ingresso...</p>;

  return (
    <section className="ticket">
      <p className="muted">Ingresso confirmado</p>
      <h1>{ticket.session.event.name}</h1>
      <p>{ticket.session.venue.name}</p>
      <p>{formatDateTime(ticket.session.startsAt)}</p>
      <p className="ticket-seat">{seatLabel(ticket.seat)}</p>
      <p>Titular: {ticket.user?.name}</p>
      <p className="muted">Código {ticket.id}</p>
      <Link to={`/reservations/${ticket.reservationId}`}>Voltar para a reserva</Link>
    </section>
  );
}
