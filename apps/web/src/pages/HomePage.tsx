import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { EventListItem } from "../api/types";
import { EventCard, EventCardSkeleton } from "../components/EventCard";

const SKELETON_COUNT = 8;
const SEARCH_DEBOUNCE_MS = 250;

export function HomePage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    const isSearch = debouncedQuery.length > 0;

    if (isSearch) {
      setSearching(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const request = isSearch
      ? api.searchEvents(debouncedQuery, controller.signal)
      : api.listEvents(controller.signal);

    request
      .then((data) => {
        setEvents(data);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") {
          return;
        }
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
        setSearching(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  const showSkeleton = loading && events.length === 0;
  const emptySearch = !loading && !searching && debouncedQuery.length > 0 && events.length === 0;

  return (
    <section>
      <div className="page-header">
        <h1>Eventos</h1>
        <p>Escolha um evento para ver sessões e reservar assentos.</p>
        <label className="search-field">
          <span className="visually-hidden">Pesquisar eventos</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar por nome, categoria ou cidade…"
            autoComplete="off"
            aria-busy={searching}
          />
        </label>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {emptySearch ? (
        <p className="muted">Nenhum evento encontrado para “{debouncedQuery}”.</p>
      ) : (
        <div className="event-grid" aria-busy={loading || searching} aria-live="polite">
          {showSkeleton
            ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <EventCardSkeleton key={index} />
              ))
            : events.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      )}
    </section>
  );
}
