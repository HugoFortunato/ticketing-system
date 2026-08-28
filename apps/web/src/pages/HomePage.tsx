import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { EventListItem } from "../api/types";
import { EventCard, EventCardSkeleton } from "../components/EventCard";

const SKELETON_COUNT = 8;

export function HomePage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listEvents()
      .then(setEvents)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
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
      <div className="event-grid" aria-busy={loading} aria-live="polite">
        {loading
          ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <EventCardSkeleton key={index} />
            ))
          : events.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
    </section>
  );
}
