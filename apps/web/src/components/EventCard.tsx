import { Link } from "react-router-dom";
import type { Event } from "../api/types";
import { formatDate } from "../lib/format";

export function EventCard({ event }: { event: Event }) {
  const firstSession = event.sessions[0];

  return (
    <Link to={`/events/${event.id}`} className="event-card">
      <img src={event.imageUrl} alt={event.name} />
      <div className="event-card-body">
        <span className="badge">{event.category}</span>
        <h2>{event.name}</h2>
        <p>{event.venue.name} · {event.venue.city}</p>
        <p className="muted">{firstSession ? formatDate(firstSession.startsAt) : "Datas em breve"}</p>
      </div>
    </Link>
  );
}
