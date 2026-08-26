# GET /sessions/:id/seats — sem Redis

Baseline V1. PostgreSQL puro, sem cache.  
Script: `load-tests/seats.js` · duração 20s · 2026-08-26  
Sessão: `44444444-4444-4444-a444-444444444441` (192 assentos + expiração lazy no request).

## Resultados

Tempos em milissegundos.

### Legenda

| Coluna | Significado |
| --- | --- |
| **VUs** | Usuários virtuais em paralelo durante os 20 s. |
| **Requests** | Total de `GET /sessions/:id/seats` no teste. Não é um número fixo: cada VU repete o GET até acabar o tempo. |
| **req/s** | Requests por segundo (throughput). |
| **avg** | Média de todas as durações. Sobe fácil com outliers. |
| **med** | Mediana: metade das requests foi mais rápida que isso, metade mais lenta. Melhor resumo do “caso típico”. |
| **p95** | 95% das requests foram iguais ou mais rápidas que esse valor. Só as 5% piores passaram. |
| **p99** | Igual ao p95, olhando o 1% mais lento (cauda ruim). |
| **max** | A request mais lenta do teste. |
| **Falhas** | Taxa de `http_req_failed` (erro de transporte ou status de falha). |

| VUs | Requests | req/s | avg | med | p95 | p99 | max | Falhas |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 1775 | 85.4 | 11.5 | 10.2 | 17.3 | 34.3 | 85 | 0% |
| 50 | 5403 | 268 | 84.0 | 71.3 | 175 | 233 | 504 | 0% |
| 100 | 5613 | 270 | 2796** | 235 | 427 | 2041 | 274s** | 0% |
| 500 | 6126 | 270 | 4337** | 644 | 20710 | 22450 | 275s** | 0% |
| 1000 | 6520 | 194 | 4570** | 969 | 25182 | 29328 | 276s** | 0.15% |

\** `avg`/`max` distorcidos por salto de relógio no WSL. Usar **med** e **p95**.

## O que isso mostra

- Já em 10 VUs (~11 ms) é **mais lento que `/events`** (~6 ms): o handler faz `releaseExpiredReservations` + busca 192 seats + `ReservationSeat`.
- Em 50 VUs a mediana vai a 71 ms (7×). Payload grande (~21 KB JSON por request) e trabalho no Postgres a cada GET.
- Em 100 VUs o throughput **estagna** (~270 req/s) — igual a 50 VUs em volume, com latência bem pior. O banco/API já saturaram.
- 500 VUs: mediana 644 ms, p95 ~21 s. Mais VUs não geram mais throughput.
- 1000 VUs: primeira **quebra visível** — `dial: i/o timeout`, 10 requests falharam (0.15%). O Node não aceita conexões a tempo. Throughput cai para 194 req/s.

## Gargalos

1. Expiração lazy no caminho de leitura (UPDATE/DELETE de reservas expiradas em todo GET).
2. Montagem do mapa de 192 assentos sem cache.
3. Resposta grande (data_received ~118 MB em 20s com 50 VUs).
4. Limite de conexões / event loop em 1000 VUs.

Candidato forte a Redis: snapshot de disponibilidade da sessão com TTL curto.

## Como repetir

```bash
k6 run -e VUS=10 -e DURATION=20s --summary-export=monitoring/redis/raw/seats-10.json load-tests/seats.js
```

Bruto: `raw/seats-<VUs>.json`.
