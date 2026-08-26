# POST /sessions/:sessionId/reservations — sem Redis

Baseline V1. PostgreSQL puro, unique `(sessionId, seatId)`.  
Script: `load-tests/reservations.js` · duração 20s · 2026-08-26

Cada iteração: `GET /seats` → escolhe 1–2 assentos aleatórios → `POST` reserva.  
**Seed completo antes de cada carga** para o inventário recomeçar (~185 assentos livres na sessão principal).

## Resultados

`http_req_duration` mistura GET seats + POST reserva.  
`conflicts` / `created` valem só para o POST (taxa sobre as tentativas de reserva).

### Legenda

| Coluna | Significado |
| --- | --- |
| **VUs** | Usuários virtuais em paralelo durante os 20 s. |
| **HTTP reqs** | Total de requests HTTP (GET seats + POST reserva). Não é um número fixo. |
| **req/s** | Requests por segundo (throughput). |
| **med** | Mediana: metade das requests foi mais rápida que isso, metade mais lenta. Melhor resumo do “caso típico”. |
| **p95** | 95% das requests foram iguais ou mais rápidas que esse valor. Só as 5% piores passaram. |
| **p99** | Igual ao p95, olhando o 1% mais lento (cauda ruim). |
| **HTTP fail** | Taxa de `http_req_failed` (timeout, dial, etc.). 409 de assento ocupado **não** entra aqui. |
| **created** | Fração das tentativas de POST que voltaram 201 (reserva criada). |
| **conflicts** | Fração das tentativas de POST que voltaram 409 (assento já tomado). |

| VUs | HTTP reqs | req/s | med (ms) | p95 (ms) | p99 (ms) | HTTP fail | created | conflicts |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 2800 | 140 | 19 | 47 | 82 | 0.9% | 85% (144) | 15% (25) |
| 50 | 3932 | 195 | 200 | 280 | 345 | 3.1% | 56% (153) | 44% (122) |
| 100 | 3523 | ~176* | 514 | 705 | 799 | 5.3% | 44% (147) | 56% (188) |
| 500 | 2937 | 116 | 4244 | 6954 | 24796 | 10.1% | 34% (151) | 66% (297) |
| 1000 | 4090 | 115 | 8048 | 10779 | 11343 | 46.3% | 7% (152) | 16% (330) |

\* rate do k6 zerou por relógio WSL.  
Em 1000 VUs, `HTTP fail` 46% inclui timeout/`dial` — por isso `conflicts` parece baixo: muita request nem chegou no unique constraint.

`created` fica em **~144–153** em todas as cargas. Isso é o teto do inventário, não da API: acabam os assentos, o resto vira 409 ou timeout.

## O que isso mostra

- 10 VUs: reserva ainda rápida (med 19 ms). Já há 15% de 409 — corrida real no PostgreSQL, como esperado.
- 50 VUs: mediana 10× pior (200 ms). Quase metade das reservas perde a corrida (44% conflict). Overselling **não** ocorreu (constraint segura).
- 100+ VUs: latência de escrita + GET seats (expiração lazy) empurra p95 para centenas de ms / segundos.
- 500 VUs: mediana 4.2 s. Throughput cai. Unique violation e lock no `ReservationSeat` são o gargalo de escrita.
- 1000 VUs: o sistema **degrada de verdade** — 46% de falha de transporte, mediana 8 s. Não é só 409; a API para de aceitar conexões.

## Gargalos

1. Unique `(sessionId, seatId)` serializa writes no mesmo assento — correto contra overselling, visível na métrica `reservation_conflicts`.
2. Cada tentativa relê o mapa de assentos no Postgres (sem hold no Redis).
3. Transação + cleanup de expirados no mesmo path do POST.
4. Inventário pequeno (192 assentos) satura rápido: depois disso o teste mede contenção/timeout, não “capacidade de venda”.
5. Um processo Node: em 1000 VUs o limite deixa de ser o 409 e passa a ser **conexão**.

Na V2, repetir **com o mesmo seed-antes-de-cada-carga**. Redis deve mudar sobretudo GET seats e a taxa de 409 vs timeout — o teto de ~150 reservas criadas em 20s só muda se o hold/checkout for mais eficiente, não se o venue continuar com 192 lugares.

## Como repetir

```bash
pnpm db:seed
k6 run -e VUS=10 -e DURATION=20s --summary-export=monitoring/redis/raw/reservations-10.json load-tests/reservations.js
```

Bruto: `raw/reservations-<VUs>.json`.
