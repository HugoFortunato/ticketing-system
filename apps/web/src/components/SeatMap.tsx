import { useMemo } from "react";
import type { Seat } from "../api/types";

type Props = {
  seats: Seat[];
  selectedIds: string[];
  onToggle: (seat: Seat) => void;
};

export function SeatMap({ seats, selectedIds, onToggle }: Props) {
  const rows = useMemo(() => {
    const grouped = new Map<string, Seat[]>();
    for (const seat of seats) {
      const current = grouped.get(seat.row) ?? [];
      current.push(seat);
      grouped.set(seat.row, current);
    }
    return [...grouped.entries()];
  }, [seats]);

  return (
    <div className="seat-map">
      <div className="stage">Palco</div>
      {rows.map(([row, rowSeats]) => (
        <div key={row} className="seat-row">
          <span className="row-label">{row}</span>
          <div className="seat-row-seats">
            {rowSeats.map((seat) => {
              const selected = selectedIds.includes(seat.id);
              const taken = seat.status !== "available";
              return (
                <button
                  key={seat.id}
                  type="button"
                  className={`seat ${taken ? "is-taken" : ""} ${selected ? "is-selected" : ""}`}
                  disabled={taken}
                  onClick={() => onToggle(seat)}
                  title={`${seat.row}${seat.number}`}
                >
                  {seat.number}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="legend">
        <span><i className="seat" /> Disponível</span>
        <span><i className="seat is-selected" /> Selecionado</span>
        <span><i className="seat is-taken" /> Reservado</span>
      </div>
    </div>
  );
}
