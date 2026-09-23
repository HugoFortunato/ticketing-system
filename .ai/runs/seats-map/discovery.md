# Discovery

- Comportamento actual (live): `@http` tem eventos, sessões e `GET /search`. **Não** há `GET /sessions/:id/seats`. `app.ts` deixa `seatRoutes` comentado.
- Legado (`modules/seats/service.ts`, off): `GET /sessions/:sessionId/seats`. 404 se sessão inexistente. Antes da lista chama `releaseExpiredReservations` (PENDING com `expiresAt` no passado → EXPIRED e apaga `ReservationSeat`). Assentos = todos os `Seat` do `venueId` da sessão. `ReservationSeat` nesta sessão: `CONFIRMED` → `sold`, resto (PENDING) → `held`, senão `available`. Schema: EXPIRED/CANCELLED já não têm row em `ReservationSeat`.
- Payload legado (raiz, sem envelope `{ event }`): `sessionId`, `event`, `venue`, `startsAt`, `endsAt`, `seats[]` (`id`, `section`, `row`, `number`, `status`).
- Web: `SeatsPage` + `SeatMap` já consomem esse payload via `api.listSeats`. Held/sold = botão disabled. “Criar reserva” chama `POST /sessions/:id/reservations` (ainda off).
- Testes: `live-api.test.ts` não cobre seats. Playwright ainda aceita erro live nessa rota.
- Regras já no código (legado): 404 sessão; statuses `available|held|sold`; expiry lazy no GET; sem `x-user-id`.
- Ambiguidades: envelope vs raiz; GET público vs header; o botão de reserva nesta task.
- Dívida fora de âmbito: POST reserva, confirm, tickets, `modules/` restantes, auth JWT.
