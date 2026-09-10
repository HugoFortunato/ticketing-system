---
name: k6-baseline
description: >-
  Runs and documents k6 load tests for the ticketing API with comparable
  with/without folders (Redis, Elasticsearch). Use when adding load tests,
  writing monitoring/*.md, comparing VUs, median, p95, req/s, or when the
  user mentions k6, baseline, or monitoring.
---

# Baseline k6

Comparação só é válida com **o mesmo script, catálogo, duração e VUs**. Protocolo: `monitoring/README.md`.

## Pastas

| Pasta | Significado |
| --- | --- |
| `monitoring/without-redis/` | Listagem/detalhe/assentos/reservas sem cache |
| `monitoring/with-redis/` | Mesmos testes com Redis |
| `monitoring/without-es/` | `GET /search` no Postgres (`ILIKE`) |
| `monitoring/with-es/` | `GET /search` via Search Service + ES |

Não misture a rodada de 4 eventos com a de 24. Declare o catálogo no `.md`.

## Scripts

| Relatório | Comando |
| --- | --- |
| `events.md` | `k6 run load-tests/events.js` |
| `event-detail.md` | `k6 run -e TARGET=detail load-tests/events.js` |
| `seats.md` | `k6 run load-tests/seats.js` |
| `reservations.md` | `pnpm db:seed` **antes de cada carga**; depois `load-tests/reservations.js` |
| `search.md` | `k6 run load-tests/search.js` (`SEARCH_ENGINE` alinhado à pasta) |

VUs padrão: 10, 50, 100, 500, 1000. Duração: **20s**. API: `http://localhost:3000`.

```bash
k6 run -e VUS=10 -e DURATION=20s --summary-export=monitoring/with-redis/raw/events-10.json load-tests/events.js
```

JSON bruto: `raw/<teste>-<VUs>.json`.

## Relatório `.md`

- Tempos em ms. Preferir **mediana** e **p95** (WSL distorce `avg`/`max`).
- Falha = `http_req_failed`. **409 de assento ocupado não é falha HTTP.**
- Tabela vs a pasta “sem X” no mesmo catálogo.
- Uma linha honesta sobre o próximo gargalo (ex.: um processo Fastify).

## Não fazer

- Comparar Redis “quente” com Postgres em catálogo diferente
- Inventar req/s se o `rate` do k6 zerou — usar `count / duração` e marcar `*`
- Gravar `with-es` com `SEARCH_ENGINE=postgres`
