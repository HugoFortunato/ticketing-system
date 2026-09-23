# Implementation

- Criado / alterado:
  - API: `reservations-repository.ts`, `prisma-reservations-repository.ts`, `make-reservations-repository.ts`, `create-reservation` / `get-reservation` (UC + controllers), erros `ReservationNotFound` / `SeatUnavailable` / `InvalidSeatSelection`, rotas em `@http/routes.ts`.
  - UI: `SeatsPage` POST + navigate; `ReservationPage` countdown + confirm/cancel desactivados.
  - Testes: vitest hold/401/409/404; Playwright mapa → reserva PENDING.
- De fora (de propósito): confirm, cancel, GET tickets HTTP; `modules/reservations` não reactivado.
- Schema: sem migration (já existia unique `(sessionId, seatId)`).
- Comandos: `tsc` api+web OK; `pnpm --filter api test` 13/13; `pnpm test:e2e` 6/6.
