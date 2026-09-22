# Agents — Ticketing System

Laboratório de system design. O chat segue `/start-task`; papéis e skills neste repo.

Não há Linear. Não copies o pipeline da Easy Schedule (PM / issues ENG).

Feature não trivial: skill `spec-driven`. Sem spec em `SPEC_READY`, não implementar.

## Papéis

| Papel | Arquivo | Faz | Não faz |
| --- | --- | --- | --- |
| Product | `.cursor/agents/product.md` | Discovery + `docs/specs/` | Código; inventar regras |
| Principal Engineer | `.cursor/agents/principal-engineer.md` | Plano a partir da spec + skills | Implementar; redefinir produto |
| Programmer | `.cursor/agents/programmer.md` | Código do plano; corrige FAIL | Inventar stack; spec |
| QA | `.cursor/agents/qa.md` | Critérios da spec + `tsc` / testes / Playwright se UI | Push; inventar métrica |
| Reviewer | `.cursor/agents/reviewer.md` | Review do diff (incl. SOLID se `@`) | Reescrever sem pedido |

Um Programmer por vez. Respostas em português.

## Skills de domínio

`spec-driven`, `tech-stack`, `create-solid-use-case`, `k6-baseline`, `search-cdc`, `code-review`, `ensure-skill`.

Domínio novo (reservas, hold Redis, CDC extra) → PE usa `ensure-skill` a partir de código que **já existe**.
