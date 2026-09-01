# GET /events/:id — com Redis

Cache Redis no detalhe do evento (mesmo JSON: venue + sessões).  
Script: `load-tests/events.js` com `TARGET=detail` · duração 20s · **2026-09-01**

Comparar com [`../without-redis/event-detail.md`](../without-redis/event-detail.md): **mesmo evento** (`33333333-3333-4333-a333-333333333331`, ~1,2 KB), **mesmo k6** (20 s, 10→1000 VUs). Sem cache cada GET ia ao Postgres (`X-Cache: OFF`). Aqui, após aquecer a chave (`events:detail:<id>`), as leituras vêm do Redis (`X-Cache: HIT`). TTL na rodada: **300 s** (`EVENTS_CACHE_TTL_SECONDS`).

## Resultados

Tempos em milissegundos. Falha = `http_req_failed`.

### Legenda

| Coluna | Significado |
| --- | --- |
| **VUs** | Usuários virtuais em paralelo durante os 20 s. |
| **Requests** | Total de `GET /events/:id` no teste. Cada VU repete o GET até acabar o tempo (`sleep(0.1)` no script). |
| **req/s** | Requests por segundo (throughput). |
| **avg** | Média de todas as durações. Sobe fácil com outliers. |
| **med** | Mediana: metade das requests foi mais rápida que isso, metade mais lenta. |
| **p95** | 95% das requests foram iguais ou mais rápidas que esse valor. |
| **p99** | Igual ao p95, olhando o 1% mais lento. |
| **max** | A request mais lenta do teste. |
| **Falhas** | Taxa de `http_req_failed`. |

| VUs | Requests | req/s | avg | med | p95 | p99 | max | Falhas |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 1940 | 92.8 | 2.6 | 2.2 | 5.1 | 11.8 | 26.7 | 0% |
| 50 | 9669 | 481 | 2.8 | 2.1 | 6.7 | 14.5 | 54.6 | 0% |
| 100 | 18822 | 907 | 5.7 | 3.0 | 21.1 | 44.4 | 84.4 | 0% |
| 500 | 46868 | 2197 | 1459** | 76.3 | 257 | 368 | 288s** | 0% |
| 1000 | 52213 | 2562 | 281 | 106 | 354 | 1511 | 20.1s | 0% |

\** `avg`/`max` distorcidos por salto de relógio no WSL. Usar **med** e **p95**. Em 10 VUs o relógio saltou no meio do teste, mas os percentis finais ficaram coerentes.

## Versus without-redis (mesmo evento, 2026-09-01)

| VUs | med sem | med com | p95 sem | p95 com | req/s sem | req/s com |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 5.5 | **2.2** | 9.1 | **5.1** | 93.1 | 92.8 |
| 50 | 8.5 | **2.1** | 44.3 | **6.7** | 415 | **481** |
| 100 | 21.9 | **3.0** | 126 | **21.1** | 702 | **907** |
| 500 | 220 | **76.3** | 407 | **257** | 823 | **2197** |
| 1000 | 248 | **106** | 14168 | **354** | 517 | **2562** |

Em 10 VUs o `sleep(0.1)` limita o throughput (~93 req/s): o Redis quase não muda o teto, só a latência (~2,5× na mediana). A partir de 50 VUs o cache **segura** o caso típico em ~2–3 ms. Em 100 VUs o p95 cai de **126 ms para 21 ms**. Em 500 VUs o throughput sobe ~2,7× (823 → **2197 req/s**). Em 1000 VUs o p95 cai de **14 s para 354 ms** e o throughput **sobe** (517 → **2562 req/s**): sem cache o Fastify + Postgres saturavam; com Redis o detalhe pequeno ainda cabe.

## O que isso mostra

- Cache quente: o caso típico fica em **~2 ms** até 100 VUs.
- O payload **não** foi enxuto (ao contrário da lista): o ganho é só deixar de ir ao Postgres.
- Em 500–1000 VUs a mediana sobe (76 ms → 106 ms) porque o event loop e as conexões começam a filar. Ainda assim o p95 em 1000 VUs fica **~40×** melhor que sem Redis.
- Zero falhas HTTP nesta rodada.

## Como repetir

```bash
export PATH="$HOME/.local/bin:$PATH"
# EVENTS_CACHE_ENABLED=true, Redis no ar, TTL >= duração da suíte
curl -sI "http://localhost:3000/events/33333333-3333-4333-a333-333333333331"  # MISS
curl -sI "http://localhost:3000/events/33333333-3333-4333-a333-333333333331"  # HIT
k6 run -e TARGET=detail -e VUS=10 -e DURATION=20s \
  --summary-export=monitoring/with-redis/raw/event-detail-10.json \
  load-tests/events.js
```

Bruto: `raw/event-detail-<VUs>.json`.
