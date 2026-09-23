# Plan

- API: `reservations-repository.ts`, Prisma adapter (transação + `releaseExpired` + P2002→409), UC create + get, factories, controllers, rotas.
- UI: `SeatsPage` POST+navigate; `ReservationPage` confirm/cancel disabled.
- DB: sem migration. User Ana do seed no vitest (upsert).
- Testes: vitest hold/409/401/404; Playwright hold.
- Não mexer: confirm/cancel HTTP, `modules/reservations` (não reactivar).
