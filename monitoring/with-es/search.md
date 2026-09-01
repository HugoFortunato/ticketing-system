# GET /search — com Elasticsearch

V3. `SEARCH_ENGINE=elasticsearch`: a API faz proxy para o Search Service (`:3001`), que consulta o índice `events`.  
Script: `load-tests/search.js` · `q=noite` · duração 20s · **2026-09-01**

Comparar com [`../without-es/search.md`](../without-es/search.md): **mesmo `q`**, **mesmo k6**. Lá cada GET faz `ILIKE` no Postgres. Aqui o documento já está desnormalizado no ES (backfill + CDC Debezium). TTL/heap do ES nesta máquina: **256 MB**.

Hop extra nesta rodada: k6 → Fastify `:3000` → Search `:3001` → Elasticsearch `:9200`.

## Resultados

Tempos em milissegundos. Falha = `http_req_failed`.

### Legenda

| Coluna | Significado |
| --- | --- |
| **VUs** | Usuários virtuais em paralelo durante os 20 s. |
| **Requests** | Total de `GET /search?q=` no teste. |
| **req/s** | Requests por segundo (throughput). |
| **avg** | Média. Sobe fácil com outliers. |
| **med** | Mediana. |
| **p95** | 95% das requests iguais ou mais rápidas. |
| **p99** | Cauda do 1% mais lento. |
| **max** | A request mais lenta. |
| **Falhas** | Taxa de `http_req_failed`. |

| VUs | Requests | req/s | avg | med | p95 | p99 | max | Falhas |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 1462 | 64.2 | 627** | 25.5 | 93.2 | 136 | 288s** | 0% |
| 50 | 4908 | 232 | 1101** | 75.7 | 287 | 438 | 288s** | 0% |
| 100 | 6123 | 303 | 223 | 191 | 475 | 616 | 1.6s | 0% |
| 500 | 7290 | 304 | 6410** | 450 | 23037 | 289s** | 289s** | 0% |
| 1000 | 9441 | 328 | 5237** | 923 | 21472 | 290s** | 290s** | 0% |

\** `avg`/`max` distorcidos por salto de relógio no WSL. Usar **med** e **p95**. Em 100 VUs o relógio não saltou.

## Versus without-es (mesmo `q=noite`, 2026-09-01)

| VUs | med sem | med com | p95 sem | p95 com | req/s sem | req/s com |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | **6.6** | 25.5 | **12.2** | 93.2 | **89** | 64 |
| 50 | **12.4** | 75.7 | **51** | 287 | **395** | 232 |
| 100 | **33.5** | 191 | **142** | 475 | **662** | 303 |
| 500 | **327** | 450 | **817** | 23037 | **~552** | 304 |
| 1000 | **300** | 923 | **511** | 21472 | **~635** | 328 |

Com **24 eventos**, o `ILIKE` no Postgres ganha: menos hops e o catálogo cabe na memória do banco. O Elasticsearch nesta rodada paga o proxy Fastify + processo Search + heap pequeno. O teto ~300 req/s em 100+ VUs é o **event loop em dois Node + ES**, não o índice.

Isto **não** invalida o pipeline: ranking, prefixo, e um catálogo grande deixam de fazer 5 `OR` + join por tecla. O k6 mostra o custo da stack no lab atual.

## O que isso mostra

- `X-Search-Engine: elasticsearch` e 4 hits para `noite` (Noite Elétrica e afins).
- CDC (Debezium RUNNING) + backfill de 24 docs. Writes no Postgres atualizam o índice via worker.
- Zero falhas HTTP. Em 500–1000 VUs o p95 explode (fila + relógio WSL).

## Como repetir

```bash
docker.exe compose up -d
pnpm search:register-debezium
pnpm search:backfill
pnpm --filter search start
pnpm --filter indexer start
SEARCH_ENGINE=elasticsearch pnpm --filter api start

export PATH="$HOME/.local/bin:$PATH"
k6 run -e VUS=10 -e DURATION=20s --summary-export=monitoring/with-es/raw/search-10.json load-tests/search.js
```

Bruto: `raw/search-<VUs>.json`.
