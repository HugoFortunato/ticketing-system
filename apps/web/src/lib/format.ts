export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value));
}

export function seatLabel(seat: { row: string; number: number; section?: string }) {
  return `${seat.section ? `${seat.section} · ` : ""}${seat.row}${seat.number}`;
}
