# Plan

- Módulos: `GET /sessions/:sessionId/seats` (agregado seats, não misturar em EventsRepository).
- API / DB: sem migration/seed (Seat já existe).
- Adapters: `seats-repository.ts` + `PrismaSeatsRepository` (`releaseExpired` + mapa). Factory `makeSeatsRepository`. UC `list-session-seats.ts` com `makeListSessionSeatsUseCase`.
- UI: esconder/desactivar “Criar reserva” na `SeatsPage`.
- Testes: vitest 404/200; Playwright mapa Palco.
- Ordem: contrato → adapter → UC → controller → rota → UI → testes.
- Riscos: expiry usa Prisma só no adapter (`lib/expiry.ts`).
- Não mexer: POST reservas, `modules/seats` (não reactivar), auth.
