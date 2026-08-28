import { Link } from "react-router-dom";
import type { EventListItem } from "../api/types";
import { formatDate } from "../lib/format";

export function EventCard({ event }: { event: EventListItem }) {
  return (
    <Link to={`/events/${event.id}`} className="event-card">
      <img src={event.imageUrl} alt={event.name} />
      <div className="event-card-body">
        <span className="badge">{event.category}</span>
        <h2>{event.name}</h2>
        <p>{event.venue.name} · {event.venue.city}</p>
        <p className="muted">
          {event.nextSessionStartsAt ? formatDate(event.nextSessionStartsAt) : "Datas em breve"}
        </p>
      </div>
    </Link>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="event-card event-card-skeleton" aria-hidden="true">
      <div className="skeleton skeleton-media" />
      <div className="event-card-body">
        <div className="skeleton skeleton-badge" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line skeleton-line-short" />
      </div>
    </div>
  );
}
