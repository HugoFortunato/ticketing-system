# /start-task

Uso: `/start-task <slug>` ou um pedido de feature. Sem Linear.

```text
DISCOVERY → SPEC_DRAFT → SPEC_READY → PLAN_READY
  → IMPLEMENTING → [FRONTEND_E2E se tocar apps/web] → QA → REVIEW → READY_TO_MERGE
```

FAIL: o Programmer corrige (máx. 2) e volta a QA (e a Playwright se UI). Review FAIL → Programmer corrige → QA.

Este chat segue a ordem. Não saltes `SPEC_READY` (humano).

1. Product — `discovery.md` + `create-spec.md`
2. Humano — “spec ok”
3. PE — `create-plan.md`
4. Programmer — `implement.md`
5. **Se o diff toca `apps/web`:** `playwright.md` (`pnpm test:e2e`) — obrigatório
6. **Se o diff toca `schema.prisma`, migrations ou `seed.ts`:** `database.md` (`pnpm db:migrate` / `pnpm db:seed`) — obrigatório
7. QA — spec + `tsc` / testes; Playwright se UI
8. Reviewer — skill `code-review` (+ SOLID se `@`)
9. `finish-task.md` — sem push
