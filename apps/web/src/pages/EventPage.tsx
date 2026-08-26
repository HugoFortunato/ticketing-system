import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Event } from "../api/types";
import { formatDateTime } from "../lib/format";

export function EventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getEvent(id)
      .then(setEvent)
      .catch((err: Error) => setError(err.message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!event) return <p>Carregando...</p>;

  return (
    <section className="event-details">
      <img className="hero" src={event.imageUrl} alt={event.name} />
      <div>
        <span className="badge">{event.category}</span>
        <h1>{event.name}</h1>
        <p className="lead">{event.description}</p>
        <p>
          {event.venue.name} · {event.venue.address}, {event.venue.city}
        </p>
      </div>
      <div>
        <h2>Sessões</h2>
        <ul className="session-list">
          {event.sessions.map((session) => (
            <li key={session.id}>
              <div>
                <strong>{formatDateTime(session.startsAt)}</strong>
                <p className="muted">até {formatDateTime(session.endsAt)}</p>
              </div>
              <Link className="button" to={`/sessions/${session.id}/seats`}>
                Selecionar assentos
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
