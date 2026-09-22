---
name: tech-stack
description: >-
  Ticketing lab stack and folder rules (Fastify, Vite, Prisma adapters,
  Redis, k6, Elasticsearch CDC). Use when choosing libraries, files, or
  architecture, implementing a feature, or reviewing whether a design invents
  Nest, Next, or a new ORM in the use case layer.
---

# Stack obrigatória

Não invente framework, pasta raiz nem ORM no domínio. Domínio novo → `ensure-skill` a partir do código existente.

## Permitido

- Monorepo pnpm: `apps/api` (Fastify + TypeScript), `apps/web` (Vite + React), `apps/search`, `apps/indexer`
- PostgreSQL 16 (Compose), Prisma só no adapter
- Redis (`EVENTS_CACHE_*`), k6 em `load-tests/`
- Elasticsearch + Debezium + Kafka para busca (`SEARCH_ENGINE`)
- Playwright em `apps/web/e2e` (`pnpm test:e2e`) quando a task toca UI
- Zod nos controllers; header `x-user-id` na V1 (sem JWT)

## Onde o código vive

| Caso | Onde |
| --- | --- |
| HTTP novo (eventos SOLID) | `apps/api/src/@http/@controllers/` + `@http/routes.ts` |
| Regra de negócio | `apps/api/src/@use-cases/<agregado>/` |
| Contrato | `apps/api/src/@repositories/*-repository.ts` |
| SQL | `apps/api/prisma/` |
| Wiring | `makeXRepository()` em `@use-cases/factories/`; `makeXUseCase()` no ficheiro do use case |
| Legado ainda não extraído | `apps/api/src/modules/` — não copiar como modelo |
| Relatórios de carga | `monitoring/with-*` e `without-*` |
| E2E UI | `apps/web/e2e/` (Playwright, `pnpm test:e2e`) |

Imports ESM: extensão `.js` (nunca `.ts`). NodeNext.

## Proibido

- NestJS, Next.js, novo package de HTTP além do Fastify da API
- Importar `@prisma/client` em `@use-cases` ou na interface do repositório
- JWT/OAuth “de produção” na V1
- Gateway/Booking como microserviço novo sem o número do k6 pedir
- Commit de `.env` (só `.env.example`)
- `console.log` de debug em código que sobe (`cacheddddd`, etc.)
- 2xx no `catch` de erro HTTP

## Comandos

```bash
pnpm --filter api dev
pnpm --filter api test
pnpm db:migrate
pnpm db:seed
pnpm --filter api exec tsc --noEmit
pnpm test:e2e
```
