# GET /events — sem Redis

Baseline V1. PostgreSQL puro, sem cache.  
Script: `load-tests/events.js` · duração 20s · **2026-08-27**

O endpoint lista **todos** os eventos com `venue` e **todas** as sessões. Sem paginação.

Catálogo desta rodada: **24 eventos**, **56 sessões**, payload ~32 KB.  
Rodada anterior (2026-08-26): 4 eventos, 6 sessões — tabela de comparação no fim.

## Resultados

Tempos em milissegundos. Falha = `http_req_failed`.

### Legenda

| Coluna | Significado |
| --- | --- |
| **VUs** | Usuários virtuais em paralelo durante os 20 s. |
| **Requests** | Total de `GET /events` no teste. Não é um número fixo: cada VU repete o GET até acabar o tempo. |
| **req/s** | Requests por segundo (throughput). |
| **avg** | Média de todas as durações. Sobe fácil com outliers. |
| **med** | Mediana: metade das requests foi mais rápida que isso, metade mais lenta. Melhor resumo do “caso típico”. |
| **p95** | 95% das requests foram iguais ou mais rápidas que esse valor. Só as 5% piores passaram. |
| **p99** | Igual ao p95, olhando o 1% mais lento (cauda ruim). |
| **max** | A request mais lenta do teste. |
| **Falhas** | Taxa de `http_req_failed` (erro de transporte ou status de falha). |

| VUs | Requests | req/s | avg | med | p95 | p99 | max | Falhas |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 1813 | 79.5 | 162** | 7.5 | 14.0 | 25.7 | 277s** | 0% |
| 50 | 5997 | 262 | 1084** | 59.3 | 112 | 178 | 278s** | 0% |
| 100 | 5872 | 290 | 241 | 229 | 306 | 452 | 3.7s | 0% |
| 500 | 6321 | 280 | 3348** | 434 | 21364 | 22254 | 278s** | 0% |
| 1000 | 6671 | 281 | 5822** | 1785 | 22439 | 23344 | 279s** | 0% |

\** `avg`/`max` distorcidos por salto de relógio no WSL (min negativo ou max ~4m37s). Usar **med** e **p95**. Em 100 VUs o relógio não saltou: avg/max são usáveis.

## O que isso mostra

- Com 10 VUs a mediana ainda é baixa (~7.5 ms). O JSON maior quase não aparece no caso típico; o p95 sobe de 8.4 ms (4 eventos) para 14 ms.
- Em 50 VUs o catálogo já pesa: mediana **59 ms** (antes 6.5 ms) e p95 **112 ms** (antes 34 ms). Throughput 262 req/s vs ~450 antes.
- Em 100 VUs a mediana vai a **229 ms** (antes 28 ms). O Postgres + serialização do join evento/venue/sessões vira o caminho crítico cedo.
- Em 500–1000 VUs o throughput **estagna ~280 req/s** (antes ~835–903). Mediana 434 ms → **1.8 s**. p95/p99 passam de **21–23 s**: fila no event loop e no banco. O teto caiu porque cada request trabalha e devolve bem mais.
- Zero erros HTTP: o servidor não cai, só **fica lento**.

## Versus baseline 4 eventos (2026-08-26)

| VUs | med antes | med agora | p95 antes | p95 agora | req/s antes | req/s agora |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 5.3 | 7.5 | 8.4 | 14.0 | 93.7 | 79.5 |
| 50 | 6.5 | 59.3 | 34.1 | 112 | ~450 | 262 |
| 100 | 27.9 | 229 | 125 | 306 | ~716 | 290 |
| 500 | 216 | 434 | 395 | 21364 | 903 | 280 |
| 1000 | 438 | 1785 | 1007 | 22439 | 835 | 281 |

O ganho de lentidão aparece a partir de 50 VUs. Em 500+ o p95 explode: o 1% / 5% pior espera dezenas de segundos na fila.

## Gargalos

1. Toda listagem bate no banco (candidato a cache Redis na V2).
2. Payload inclui sessões completas mesmo na home (~32 KB, 56 sessões).
3. Sem paginação: o custo cresce com o catálogo.
4. Um único processo Fastify: em 500+ VUs a conexão espera (`http_req_waiting` ≈ duração total).

## Como repetir

```bash
export PATH="$HOME/.local/bin:$PATH"
k6 run -e VUS=10 -e DURATION=20s --summary-export=monitoring/without-redis/raw/events-10.json load-tests/events.js
```

Bruto: `raw/events-<VUs>.json`.
