import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Reservation } from "../api/types";
import { useUser } from "../context/UserContext";
import { formatDateTime, seatLabel } from "../lib/format";

function remainingLabel(expiresAt: string, now: number) {
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return "Expirada";
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function ReservationPage() {
  const { id } = useParams<{ id: string }>();
  const { userId } = useUser();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!id) return;
    api
      .getReservation(id)
      .then(setReservation)
      .catch((err: Error) => setError(err.message));
  }, [id]);

  async function confirm() {
    if (!id || !userId) return;
    setConfirming(true);
    setError(null);
    try {
      const next = await api.confirmReservation(id, userId);
      setReservation(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao confirmar reserva");
    } finally {
      setConfirming(false);
    }
  }

  if (error && !reservation) return <p className="error">{error}</p>;
  if (!reservation) return <p>Carregando reserva...</p>;

  return (
    <section className="panel">
      <p className="muted">{reservation.session.event.name}</p>
      <h1>Reserva</h1>
      <p>
        Status: <strong>{reservation.status}</strong>
      </p>
      {reservation.status === "PENDING" ? (
        <p>Expira em {remainingLabel(reservation.expiresAt, now)}</p>
      ) : null}
      <p>
        {reservation.session.venue.name} · {formatDateTime(reservation.session.startsAt)}
      </p>
      <ul>
        {reservation.seats.map((item) => (
          <li key={item.id}>{seatLabel(item.seat)}</li>
        ))}
      </ul>
      {error ? <p className="error">{error}</p> : null}
      {reservation.status === "PENDING" ? (
        <div className="actions">
          <button
            className="button"
            type="button"
            disabled={confirming || !userId}
            onClick={() => void confirm()}
          >
            {confirming ? "Confirmando..." : "Confirmar e gerar ingressos"}
          </button>
          <button className="button button-secondary" type="button" disabled title="Cancel na próxima task">
            Cancelar
          </button>
        </div>
      ) : null}
      {reservation.tickets.length > 0 ? (
        <div>
          <h2>Ingressos</h2>
          <ul>
            {reservation.tickets.map((ticket) => (
              <li key={ticket.id}>
                <Link to={`/tickets/${ticket.id}`}>Ver ingresso {ticket.id.slice(0, 8)}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
