# Plan

Skills: `tech-stack`, `create-solid-use-case`. Sem skill nova: GET ticket espelha `get-reservation`; confirm estende `ReservationsRepository`. Sem migration/seed.

## Ordem

1. API confirm: `confirmHold` no contrato + adapter (tx: `releaseExpired` → dono 403 → CONFIRMED idempotente → senão PENDING → tickets `createMany` → status CONFIRMED). P2002 → 409. Erros: `ForbiddenError`, conflito 409 (não PENDING / expirada).
2. UC `confirm-reservation` + controller POST `/reservations/:id/confirm` (`x-user-id`, payload raiz).
3. API ticket: `tickets-repository` + Prisma `findById` + UC `get-ticket` + GET `/tickets/:id` público, raiz, 404 `TICKET_NOT_FOUND`.
4. UI: `ReservationPage` chama `confirmReservation`, fica na rota; cancel disabled.
5. Vitest + Playwright (hold → confirm → CONFIRMED → TicketPage).
6. Não mexer: DELETE cancel, `modules/*`, JWT, schema Prisma.
