---
name: spec-driven
description: >-
  Ticketing lab spec-driven workflow: Human intent → discovery → spec → plan →
  implement → Playwright se UI → QA → review. Use when the user says /start-task, pede uma
  feature, spec, plano técnico, ou docs/specs.
---

# Spec-driven (ticketing lab)

Spec = o quê e porquê. Plano = como. Sem spec aprovada não implementes feature não trivial.

## Ordem

Product (`SPEC_DRAFT`) → humano (`SPEC_READY`) → PE (`PLAN_READY`) → Programmer → Playwright se UI → migrate/seed se schema/seed → QA → Reviewer → `READY_TO_MERGE`.

Typo / bug óbvio: podes ir directo ao Programmer e anotar o run.

Papéis: `product`, `principal-engineer`, `programmer`, `qa`, `reviewer`. Skill SOLID no Programmer/Reviewer quando o diff for `@`.

## Arranque

1. `.ai/workflows/start-task.md`
2. TASK-ID = slug. Copia `.ai/runs/_template/` → `.ai/runs/<TASK-ID>/`
3. Actualiza `state.md`. Não saltes `SPEC_READY`.

## Artefactos

| Quem | Onde |
| --- | --- |
| Product | `docs/specs/<feature>.md` |
| PE | `.ai/runs/<id>/plan.md` |
| Chat | `state.md` |
| Programmer / QA / Reviewer | `implementation.md`, `playwright-report.md` (se UI), `qa-report.md`, `review.md` |

## Regras

- Não inventes regras de negócio.
- Um Programmer de cada vez. FAIL: o mesmo Programmer corrige (máx. 2); depois para.
- Task que toca `apps/web`: `pnpm test:e2e` obrigatório (`.ai/workflows/playwright.md`).
- Task que toca modelos Prisma, migrations ou `seed.ts`: `.ai/workflows/database.md` (`pnpm db:migrate` / `pnpm db:seed`).
- Dívida `modules/` / `critical-flows` ≠ falha da spec.
- Sem Nest, Next, Linear, `packages/` novos.
