# Discovery

- Live: eventos, sessões, search, `GET /sessions/:id/seats`. **Nenhuma** rota de reserva em `@http`. `reservationRoutes` comentado em `app.ts`.
- Legado (`modules/reservations`, off):
  - `POST /sessions/:sessionId/reservations` + `x-user-id` + `{ seatIds }` → 201 reserva PENDING, TTL `RESERVATION_TTL_SECONDS` (600). Unique `(sessionId, seatId)` → conflito. User inexistente → 400. Sessão 404. Assento de outro venue → 400. seatIds vazio → 400. Dedup de IDs.
  - `GET /reservations/:id` **sem** header; expiry lazy global; 404 se não existe.
  - `DELETE /reservations/:id` + header: só dono; só PENDING; senão 400/409; apaga `ReservationSeat`.
  - `POST /reservations/:id/confirm` + header: tickets + CONFIRMED; dono; PENDING; expirada → 409; já CONFIRMED → idempotente.
- Web: `SeatsPage` tem botão disabled (spec seats-map). `ReservationPage` espera GET/confirm/cancel na raiz (não `{ reservation }`). Confirm navega para `/tickets/:id` (**GET ticket ainda off**).
- Testes live não cobrem reservas.
- Dívida: GET ticket, `modules/` restantes, auth JWT.
