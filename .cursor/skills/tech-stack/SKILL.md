---
name: tech-stack
description: >-
  Ticketing lab stack and folder rules (Fastify, Vite, Prisma/Drizzle adapters,
  Redis, k6, Elasticsearch CDC). Use when choosing libraries, files, or
  architecture, implementing a feature, or reviewing whether a design invents
  Nest, Next, or a new ORM in the use case layer.
---

# Stack obrigatória

Não invente framework, pasta raiz nem ORM no domínio. Domínio novo → `ensure-skill` a partir do código existente.

## Permitido

- Monorepo pnpm: `apps/api` (Fastify + TypeScript), `apps/web` (Vite + React), `apps/search`, `apps/indexer`
- PostgreSQL 16 (Compose), Prisma **e/ou** Drizzle só no adapter (`EVENTS_ORM`)
- Redis (`EVENTS_CACHE_*`), k6 em `load-tests/`
- Elasticsearch + Debezium + Kafka para busca (`SEARCH_ENGINE`)
- Zod nos controllers; header `x-user-id` na V1 (sem JWT)

## Onde o código vive

| Caso | Onde |
| --- | --- |
| HTTP novo (eventos SOLID) | `apps/api/src/@http/@controllers/` + `@http/routes.ts` |
| Regra de negócio | `apps/api/src/@use-cases/<agregado>/` |
| Contrato | `apps/api/src/@repositories/*-repository.ts` |
| SQL | `.../prisma/` e `.../drizzle/` |
| Wiring | `@use-cases/factories/` (`chooseRepository`, `EVENTS_ORM`) |
| Legado ainda não extraído | `apps/api/src/modules/` — não copiar como modelo |
| Relatórios de carga | `monitoring/with-*` e `without-*` |

Imports ESM: extensão `.js` (nunca `.ts`). NodeNext.

## Proibido

- NestJS, Next.js, novo package de HTTP além do Fastify da API
- Importar `@prisma/client` / `drizzle-orm` em `@use-cases` ou na interface do repositório
- JWT/OAuth “de produção” na V1
- Gateway/Booking como microserviço novo sem o número do k6 pedir
- Commit de `.env` (só `.env.example`)
- `console.log` de debug em código que sobe (`cacheddddd`, etc.)
- 2xx no `catch` de erro HTTP

## Comandos

```bash
pnpm --filter api dev
pnpm --filter api test
pnpm --filter api exec tsc --noEmit
```
