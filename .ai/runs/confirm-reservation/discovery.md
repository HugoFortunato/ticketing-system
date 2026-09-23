# Discovery

- Live (`@http`): eventos, sessões, search, seats, `POST /sessions/:sessionId/reservations`, `GET /reservations/:id`. **Não** há confirm nem tickets. `reservationRoutes` e `ticketRoutes` comentados em `app.ts`.
- Legado off (`modules/reservations/service.ts` `confirmReservation`):
  - `POST /reservations/:id/confirm` + `x-user-id`.
  - Não existe → 404.
  - Dono errado → 400 `BAD_REQUEST` (“A reserva pertence a outro usuário”).
  - Já `CONFIRMED` → idempotente (devolve a reserva).
  - Não `PENDING` → 409.
  - Expirada → marca EXPIRED, apaga `ReservationSeat`, 409.
  - Cria `Ticket` por assento; unique ticket → 409.
  - Expiry lazy no início da transação.
- Legado tickets: `GET /tickets/:id` **sem** header; 404 se não existe; objecto na raiz.
- Web: `ReservationPage` — botão confirm/cancel disabled. Lista de ingressos só se `tickets.length > 0`. `TicketPage` chama `GET /tickets/:id` (hoje 404). Client já tem `confirmReservation` e `getTicket` na raiz.
- Vitest: hold coberto; confirm não. Playwright: confirm button disabled.
- Dívida: cancel DELETE; JWT; `modules/` restantes.
