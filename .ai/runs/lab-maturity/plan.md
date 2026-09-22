# Plan

- Módulos: sessões (`POST /events/:eventId/sessions`, `GET /sessions/:id`); erros HTTP; remover Drizzle; testes live; CI.
- API / DB: sem migration/seed.
- Adapters: só Prisma (`makeEventsRepository` / `makeSessionsRepository` instanciam Prisma).
- Testes: `apps/api/test/live-api.test.ts`; skip legado; Playwright sessão no detalhe; `.github/workflows/ci.yml`.
- Ordem (um Programmer): erros base → Prisma only → sessões → vitest → e2e → CI/skills.
- Riscos: envelope `{ session }` no client web; plugin deixa de mapear P2002 (reservas off).
- Não mexer: auth, `modules/` (não apagar), search/indexer, k6.
