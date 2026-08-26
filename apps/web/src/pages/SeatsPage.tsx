import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Seat } from "../api/types";
import { SeatMap } from "../components/SeatMap";
import { useUser } from "../context/UserContext";
import { formatDateTime, seatLabel } from "../lib/format";

export function SeatsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { userId } = useUser();
  const navigate = useNavigate();
  const [data, setData] = useState<Awaited<ReturnType<typeof api.listSeats>> | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    api
      .listSeats(sessionId)
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [sessionId]);

  const selectedSeats = data?.seats.filter((seat) => selectedIds.includes(seat.id)) ?? [];

  function toggleSeat(seat: Seat) {
    setSelectedIds((current) =>
      current.includes(seat.id) ? current.filter((id) => id !== seat.id) : [...current, seat.id],
    );
  }

  async function reserve() {
    if (!sessionId || selectedIds.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const reservation = await api.createReservation(sessionId, selectedIds, userId);
      navigate(`/reservations/${reservation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar reserva");
    } finally {
      setSubmitting(false);
    }
  }

  if (!data) return error ? <p className="error">{error}</p> : <p>Carregando assentos...</p>;

  return (
    <section className="seats-page">
      <div>
        <p className="muted">{data.event.name}</p>
        <h1>{data.venue.name}</h1>
        <p>{formatDateTime(data.startsAt)}</p>
        <SeatMap seats={data.seats} selectedIds={selectedIds} onToggle={toggleSeat} />
      </div>
      <aside className="selection-panel">
        <h2>Sua seleção</h2>
        {selectedSeats.length === 0 ? (
          <p className="muted">Nenhum assento selecionado.</p>
        ) : (
          <ul>
            {selectedSeats.map((seat) => (
              <li key={seat.id}>{seatLabel(seat)}</li>
            ))}
          </ul>
        )}
        {error ? <p className="error">{error}</p> : null}
        <button
          className="button"
          disabled={selectedSeats.length === 0 || submitting}
          onClick={() => void reserve()}
        >
          {submitting ? "Reservando..." : "Criar reserva"}
        </button>
      </aside>
    </section>
  );
}
