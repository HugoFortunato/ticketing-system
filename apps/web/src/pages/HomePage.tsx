import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Event } from "../api/types";
import { EventCard } from "../components/EventCard";

export function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listEvents()
      .then(setEvents)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <section>
      <div className="page-header">
        <h1>Eventos</h1>
        <p>Escolha um evento para ver sessões e reservar assentos.</p>
      </div>
      <div className="event-grid">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
