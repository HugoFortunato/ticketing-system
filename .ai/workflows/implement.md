# Implement

Programmer. Requer `PLAN_READY` e `SPEC_READY`.

1. Lê a spec e `plan.md`.
2. Só os ficheiros do plano. `tech-stack` + `create-solid-use-case` se for `@`.
3. Não copies `modules/*/service.ts`. Contrato novo → adapter Prisma.
4. Schema/seed: `.ai/workflows/database.md` — **migration + migrate (e seed se o seed mudou) na mesma task**.
5. `pnpm --filter api exec tsc --noEmit` (web: `pnpm --filter web exec tsc --noEmit` se UI).
6. Se o plano/diff toca `apps/web`: `.ai/workflows/playwright.md` — **sem isto a task FE não fecha**.
7. `implementation.md` (inclui se correste migrate/seed). Sem review longo, sem push.
8. FAIL de tsc/teste/Playwright **desta spec**: corrige tu (máx. 2 tentativas). Depois para.

Estado: `IMPLEMENTING` → FRONTEND_E2E (se UI) → QA.
