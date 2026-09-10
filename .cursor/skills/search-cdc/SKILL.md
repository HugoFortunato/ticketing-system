---
name: search-cdc
description: >-
  Ticketing search path: Postgres ILIKE vs Elasticsearch via Debezium, Kafka,
  indexer, and Search Service. Use when changing GET /search, SEARCH_ENGINE,
  Debezium connector, indexer, apps/search, or CDC topics.
---

# Search + CDC

Dois motores, um endpoint na API: `GET /search?q=`. Flag `SEARCH_ENGINE` (`postgres` | `elasticsearch`).

## Peças

| Peça | Path / porta |
| --- | --- |
| Proxy / ILIKE | `apps/api/src/modules/search/` (ainda legado) |
| Search Service | `apps/search` `:3001` |
| Indexer (CDC + backfill) | `apps/indexer` |
| Connector | `scripts/register-debezium.sh` → Connect `:8083` |
| ES | Compose `:9200` |
| Kafka | Compose (broker interno `kafka:9092`) |

Postgres precisa de `wal_level=logical` (já no `docker-compose.yml`).

## Subir ES

```bash
pnpm db:up
pnpm search:register-debezium
pnpm search:backfill
pnpm --filter search start
pnpm --filter indexer start
SEARCH_ENGINE=elasticsearch pnpm --filter api dev
```

Tabelas no connector: `public.Event`, `public.Venue`, `public.Session`. Índice montado no indexer (`ensure-index`, `documents.ts`).

## Regras

- Query vazia → lista vazia; sanitizar `%` `_`; teto de tamanho (ver `normalizeSearchQuery`).
- `elasticsearch` = HTTP para `SEARCH_SERVICE_URL`, não query Prisma no Fastify.
- Documento desnormalizado (card da home / `EventListItem`), não o grafo completo do `GET /events/:id`.
- k6: `load-tests/search.js` + pastas `monitoring/without-es/` e `with-es/` (`k6-baseline`).

## Não fazer

- Indexar no request path da API (o worker consome Kafka)
- Ligar segurança xpack no Compose local sem necessidade
- Mudar `table.include.list` sem atualizar o indexer
