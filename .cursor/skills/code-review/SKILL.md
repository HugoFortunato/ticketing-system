---
name: code-review
description: >-
  Review ticketing-system diffs against lab standards (SOLID layers, ORM
  adapters, Fastify, k6 reports, search CDC). Use when reviewing pull requests,
  examining code changes, after implementing a use case, or when the user asks
  for a code review.
---

# Code review — Ticketing

Revise o **diff** (não o repo inteiro, salvo pedido).

1. `git status` / `git diff`.
2. Checklist abaixo + [STANDARDS.md](STANDARDS.md). Use `create-solid-use-case` se o diff toca `@use-cases` / `@http` / `@repositories`.
3. Reporte por severidade. Não reescreva código a menos que peçam correção.

## Checklist

- [ ] Sem Nest/Next; sem ORM no use case ou na interface do repositório
- [ ] Prisma só em `@repositories/prisma/` + `makeXRepository()`
- [ ] Controller: Zod; `catch` só erro de domínio; resto `throw err`; **nunca 2xx em falha**
- [ ] Imports `.js` (NodeNext)
- [ ] Rota nova em `@http/routes.ts` se for fatia SOLID
- [ ] Sem `.env` commitado; sem `console.log` de debug
- [ ] Relatório k6: mesmo script/catálogo; mediana/p95; pasta `with-*` vs `without-*`
- [ ] Search: `SEARCH_ENGINE` coerente; CDC não no request path da API

## Formato

- 🔴 **Crítico**: bloqueia (bug, vazamento, camada quebrada)
- 🟡 **Sugestão**: vale corrigir se o diff já toca o arquivo
- 🟢 **Nice to have**: opcional

Cada item: arquivo + o que está errado + correção (1–2 linhas).
