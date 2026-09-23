# Implementation

- `GET /sessions/:sessionId/seats` em `@http` / `ListSessionSeatsUseCase` / `PrismaSeatsRepository`.
- Payload na raiz (spec). Hold expirado no adapter via `lib/expiry.ts`.
- `SeatsPage`: botão “Criar reserva” disabled. Sem POST.
- Vitest 404/200; Playwright mapa.
- Sem migration.

`tsc` api+web OK. Vitest/e2e **não corridos**: Postgres `localhost:5432` e Redis inacessíveis neste ambiente; API `/health` down.
