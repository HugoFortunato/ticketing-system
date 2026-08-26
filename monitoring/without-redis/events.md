# GET /events — sem Redis

Baseline V1. PostgreSQL puro, sem cache.  
Script: `load-tests/events.js` · duração 20s · 2026-08-26

O endpoint lista **todos** os eventos com `venue` e **todas** as sessões. Sem paginação.

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
| 10 | 1880 | 93.7 | 5.7 | 5.3 | 8.4 | 15.5 | 39 | 0% |
| 50 | 9029 | ~450* | 10.1 | 6.5 | 34.1 | 65.7 | 124 | 0% |
| 100 | 14328 | ~716* | 460** | 27.9 | 125 | 222 | 274s** | 0% |
| 500 | 18479 | 903 | 444 | 216 | 395 | 12326 | 20s | 0% |
| 1000 | 18621 | 835 | 3698** | 438 | 1007 | 22021 | 275s** | 0% |

\* `rate` do k6 saiu 0 por salto de relógio no WSL; req/s aproximado = `count / 20s`.  
\** `avg`/`max` distorcidos pelo mesmo salto. Usar **med** e **p95**.

## O que isso mostra

- Com 10 VUs a API responde em ~5–8 ms. A lentidão percebida no browser **não** é este JSON; no frontend as imagens (Unsplash) e o render pesam mais.
- Até 50 VUs o p95 ainda é baixo (~34 ms).
- Em 100 VUs a mediana sobe para ~28 ms e o p95 passa de 100 ms: o Postgres vira o caminho crítico (join evento + venue + sessões em todo GET).
- Em 500–1000 VUs o throughput **não escala** (903 → 835 req/s). A mediana vai a 216 ms e 438 ms. p99 explode para dezenas de segundos: fila no event loop do Node e no PostgreSQL.
- Zero erros HTTP: o servidor não cai, só **fica lento**. Gargalo clássico de read sem cache.

## Gargalos

1. Toda listagem bate no banco (candidato a cache Redis na V2).
2. Payload inclui sessões completas mesmo na home.
3. Sem paginação: o custo cresce com o catálogo.
4. Um único processo Fastify: em 1000 VUs a conexão começa a esperar (`http_req_waiting` ≈ duração total).

## Como repetir

```bash
k6 run -e VUS=10 -e DURATION=20s --summary-export=monitoring/redis/raw/events-10.json load-tests/events.js
```

Bruto: `raw/events-<VUs>.json`.
