# GET /events/:id — sem Redis

Baseline. PostgreSQL puro, sem cache.  
Script: `load-tests/events.js` com `TARGET=detail` · duração 20s · **2026-09-01**

Evento da rodada: `33333333-3333-4333-a333-333333333331` (Noite Elétrica), venue + **2 sessões**, payload ~1,2 KB.  
Cada GET vai ao Postgres (`X-Cache: OFF`).

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
| 10 | 1872 | 93.1 | 6.1 | 5.5 | 9.1 | 21.1 | 84.3 | 0% |
| 50 | 8685 | 415 | 114** | 8.5 | 44.3 | 84.0 | 288s** | 0% |
| 100 | 14598 | 702 | 431** | 21.9 | 126 | 223 | 288s** | 0% |
| 500 | 16956 | 823 | 492 | 220 | 407 | 17081 | 20.4s | 0% |
| 1000 | 16764 | 517 | 3700** | 248 | 14168 | 27342 | 288s** | 0% |

\** `avg`/`max` distorcidos por salto de relógio no WSL (max ~4m48s). Usar **med** e **p95**. Em 500 VUs o relógio não saltou da mesma forma: avg/max são usáveis.

## O que isso mostra

- O detalhe é bem mais barato que a listagem completa (~32 KB / 56 sessões). Com 10 VUs a mediana já é **5,5 ms** (lista sem Redis: 7,5 ms) e o throughput bate no teto do `sleep(0.1)` (~90 req/s).
- Em 50–100 VUs o Postgres ainda aguenta o caso típico (med **8,5 ms** → **22 ms**), mas o p95 já sobe para **44 ms** e **126 ms**.
- Em 500 VUs a mediana vai a **220 ms** e o p99 explode (**17 s**): fila no event loop e no banco. Throughput **823 req/s** — mais alto que a lista sem cache (~280 req/s) porque o JSON é pequeno.
- Em 1000 VUs o throughput **cai para 517 req/s**. Mediana ainda ~250 ms, mas p95 **14 s**: conexões à espera (`http_req_connecting` na cauda). Zero erros HTTP: o servidor não cai, só **fica lento**.

## Gargalos

1. Todo detalhe bate no banco (join evento + venue + sessões).
2. Um único processo Fastify: em 500+ VUs a espera na fila domina.
3. Payload pequeno (~1,2 KB) — o custo aqui é sobretudo **query + serialização**, não bytes na rede.

## Como repetir

```bash
export PATH="$HOME/.local/bin:$PATH"
# EVENTS_CACHE_ENABLED=false e API estável (sem tsx watch)
k6 run -e TARGET=detail -e VUS=10 -e DURATION=20s \
  --summary-export=monitoring/without-redis/raw/event-detail-10.json \
  load-tests/events.js
```

Bruto: `raw/event-detail-<VUs>.json`.
