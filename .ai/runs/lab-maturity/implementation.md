# Implementation

- Sessões: `POST /events/:eventId/sessions`, `GET /sessions/:id` em `@http` / `@use-cases/sessions` / Prisma.
- Erros: `UseCaseError` + `AppError` no error-handler; sem Prisma no plugin. Venue em falta → 404 `VENUE_NOT_FOUND`.
- Drizzle / `EVENTS_ORM` / `choose-factory` removidos.
- Testes: `apps/api/test/live-api.test.ts` (9). `critical-flows` apagado (rotas mortas).
- Playwright: detalhe com sessão. CI: `.github/workflows/ci.yml`.
- Sem migration. Sem auth nova.

Comandos: `tsc` api+web, `pnpm --filter api test`, `pnpm test:e2e` — pass.
