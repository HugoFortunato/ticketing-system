# Ticketing System

Laboratório de **system design**: uma plataforma de eventos e reserva de ingressos, inspirada conceitualmente no Ticketmaster — **não é um clone**.

A V1 está pronta: monólito modular (React + Fastify + PostgreSQL), fluxo completo **evento → sessão → assento → reserva → ingresso**, e um baseline de carga com **k6**. Gargalos eram esperados. Fazem parte do experimento.

> **EN** — Educational ticketing lab. V1 is a modular monolith measured with k6. Redis, Elasticsearch, Debezium and Kafka are the target architecture, added one piece at a time when the numbers justify it.

| Status | Stack | Baseline |
| --- | --- | --- |
| **V1 completa** · V2 = Redis | Vite, Fastify, Prisma, PostgreSQL 16, k6 | [monitoring/without-redis](monitoring/without-redis/) |

- [Objetivos](#objetivos)
- [Arquitetura](#arquitetura)
- [Como executar](#como-executar)
- [Baseline k6 (sem Redis)](#baseline-k6-sem-redis)
- [Domínio e API](#domínio-e-api)
- [Roadmap](#roadmap)

---

## Objetivos

1. **Aprender arquitetura na prática**, não só no whiteboard. Spec primeiro ([`specs/ticketing-system-plan-v1.md`](specs/ticketing-system-plan-v1.md)), código depois.
2. **Entregar um produto mínimo real**: listar eventos, escolher sessão, reservar assentos, confirmar ingresso.
3. **Medir antes de otimizar.** Cada carga k6 vira relatório em `monitoring/` (mediana, p95/p99, VUs, req/s). Sem Redis na V1 de propósito.
4. **Evoluir só quando o número pedir.** Redis, Elasticsearch, Debezium e Kafka entram um de cada vez, com o mesmo teste repetido para comparar.

O que este repo **não** pretende ser: um SaaS de produção, um clone fiel do Ticketmaster, nem um monólito eterno. É um laboratório versionado.

---

## Arquitetura

### Hoje (V1)

```
Frontend (Vite + React)
        ↓ HTTP
Backend (Fastify, monólito modular)
        ↓ SQL
PostgreSQL
```

Um processo Fastify, organizado por domínio (`events`, `sessions`, `seats`, `reservations`, `tickets`). Sem cache, fila, search engine ou microservices. A concorrência de assentos é a unique `(sessionId, seatId)` no Postgres.

### Alvo (system design)

O diagrama abaixo é o **norte** — ainda não está todo no código. A V2 começa pelo Redis (cache de leitura de eventos + hold de reserva com TTL).

![System design alvo: API Gateway, Search, Event, Booking, Redis, Elasticsearch, Debezium e Kafka](docs/images/architecture.png)

| Bloco | Papel |
| --- | --- |
| **API Gateway** | Entrada única; roteia para Search, Event e Booking |
| **Search** | Busca em **Elasticsearch** |
| **Event** | Catálogo; cache Redis nas leituras quentes |
| **Booking** | Reserva; hold no Redis com **TTL** (no diagrama, 7 min) |
| **PostgreSQL** | Fonte da verdade |
| **Debezium → Kafka → Worker** | CDC: mudanças no banco alimentam o índice de busca |

Cada peça entra quando o baseline mostrar o gargalo correspondente. Relatórios futuros: [`monitoring/with-redis/`](monitoring/with-redis/).

---

## Como executar

Pré-requisitos: **Node 20+**, **pnpm 9+**, **Docker** (PostgreSQL). **k6** só para load test.

```bash
pnpm install

# banco
pnpm db:up
# no WSL sem o binário docker: docker.exe compose up -d postgres

pnpm db:migrate
pnpm db:seed

# API :3000 · web :5173
pnpm dev
```

Copie [`.env.example`](.env.example) se precisar. A API lê `apps/api/.env`.

```bash
pnpm test          # fluxos críticos da API
pnpm db:studio     # Prisma Studio em :5555
```

### Estrutura

```
apps/api          Fastify + Prisma
apps/web          Vite + React
load-tests/       scripts k6
monitoring/       relatórios de carga (with / without Redis)
docs/images/      system design
specs/            spec da V1
```

---

## Baseline k6 (sem Redis)

Máquina: WSL2, 8 vCPU, 7.7 GiB RAM · k6 v0.57.0 · **20 s** por carga · 2026-08-26.

No WSL o relógio às vezes salta: ignore `avg`/`max` absurdos e use **mediana** e **p95**. Análise completa em cada arquivo da pasta [`monitoring/without-redis/`](monitoring/without-redis/). Protocolo: [`monitoring/README.md`](monitoring/README.md).

Tempos em **ms**. Falha = erro de transporte (409 de assento ocupado **não** conta como falha HTTP).

### `GET /events`

Catálogo com venue e **todas** as sessões. Sem paginação. Toda listagem bate no Postgres.

| VUs | Requests | req/s | med | p95 | p99 | Falhas |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 1880 | 93.7 | 5.3 | 8.4 | 15.5 | 0% |
| 50 | 9029 | ~450 | 6.5 | 34.1 | 65.7 | 0% |
| 100 | 14328 | ~716 | 27.9 | 125 | 222 | 0% |
| 500 | 18479 | 903 | 216 | 395 | 12326 | 0% |
| 1000 | 18621 | 835 | 438 | 1007 | 22021 | 0% |

Até 50 VUs o p95 ainda é baixo. Em 500–1000 VUs o throughput **não escala** (903 → 835 req/s): o servidor não cai, só fica lento. Candidatos V2: cache Redis da listagem + payload mais magro (a home não precisa de todas as sessões).

Detalhes: [`monitoring/without-redis/events.md`](monitoring/without-redis/events.md).

### `GET /sessions/:id/seats`

192 assentos + expiração lazy no request. Já em 10 VUs é mais lento que `/events`.

| VUs | Requests | req/s | med | p95 | p99 | Falhas |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 1775 | 85.4 | 10.2 | 17.3 | 34.3 | 0% |
| 50 | 5403 | 268 | 71.3 | 175 | 233 | 0% |
| 100 | 5613 | 270 | 235 | 427 | 2041 | 0% |
| 500 | 6126 | 270 | 644 | 20710 | 22450 | 0% |
| 1000 | 6520 | 194 | 969 | 25182 | 29328 | 0.15% |

Throughput estagna ~270 req/s a partir de 50–100 VUs. Em 1000 VUs aparece timeout de conexão. Candidato Redis: snapshot de disponibilidade da sessão com TTL curto.

Detalhes: [`monitoring/without-redis/seats.md`](monitoring/without-redis/seats.md).

### `POST /sessions/:id/reservations`

Cada iteração: GET seats → POST reserva (1–2 assentos). Seed completo **antes de cada carga**. `created` trava em ~150: teto do inventário (192 lugares), não da API.

| VUs | HTTP reqs | req/s | med | p95 | HTTP fail | created | conflicts |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 2800 | 140 | 19 | 47 | 0.9% | 85% (144) | 15% (25) |
| 50 | 3932 | 195 | 200 | 280 | 3.1% | 56% (153) | 44% (122) |
| 100 | 3523 | ~176 | 514 | 705 | 5.3% | 44% (147) | 56% (188) |
| 500 | 2937 | 116 | 4244 | 6954 | 10.1% | 34% (151) | 66% (297) |
| 1000 | 4090 | 115 | 8048 | 10779 | 46.3% | 7% (152) | 16% (330) |

A unique impede overselling: 409 é corrida real, não bug. Em 1000 VUs quase metade das requests nem chega no banco (`dial` / timeout).

Detalhes: [`monitoring/without-redis/reservations.md`](monitoring/without-redis/reservations.md).

### Como repetir

```bash
k6 run -e VUS=10 -e DURATION=20s load-tests/events.js
k6 run -e VUS=10 -e DURATION=20s load-tests/seats.js

pnpm db:seed   # inventário limpo antes de cada carga de reserva
k6 run -e VUS=10 -e DURATION=20s load-tests/reservations.js
```

Variáveis: `BASE_URL`, `VUS`, `DURATION`, `SESSION_ID`, `USER_IDS`.

---

## Domínio e API

```
User
Event  →  Session  →  Venue
                       ↓
                      Seat

Reservation (PENDING | CONFIRMED | CANCELLED | EXPIRED)
  └── ReservationSeat  UNIQUE (sessionId, seatId)
Ticket                 UNIQUE (sessionId, seatId)
```

Reserva `PENDING` expira de forma **lazy** (`RESERVATION_TTL_SECONDS=600`). Sem worker e sem TTL no Redis — isso muda na V2.

Auth da V1: header `x-user-id` (sem JWT). Seed: usuária Ana `11111111-1111-4111-a111-111111111111`, sessão Noite Elétrica `44444444-4444-4444-a444-444444444441`.

| Método | Rota |
| --- | --- |
| `GET` | `/health` `/users` `/venues` `/events` `/events/:id` `/sessions/:id` `/sessions/:id/seats` `/reservations/:id` `/tickets/:id` |
| `POST` | `/events` `/events/:id/sessions` `/sessions/:id/reservations` `/reservations/:id/confirm` |
| `PATCH` / `DELETE` | `/events/:id` · cancelar reserva |

Fluxo: lista → sessão → mapa de assentos (`available \| held \| sold`) → `PENDING` → confirm emite `Ticket`. Unique violation → `409`.

---

## Roadmap

| Versão | O quê | Por quê (pelo baseline) |
| --- | --- | --- |
| **V1** | Monólito + Postgres | Produto e medição. Feito. |
| **V2** | Redis: cache `GET /events` + hold/TTL de reserva | Listagem e mapa de assentos saturam o banco; expiração lazy no request path |
| **V3+** | Kafka, Elasticsearch, Debezium/CDC, gateway | Busca, desacoplamento e projeção — quando leitura/índice pedirem |

Decisões da V1 (propositalmente simples): Fastify em vez de Nest, Vite em vez de Next, unique constraint em vez de lock pessimista, Prisma só na API.

---

## Licença

[MIT](LICENSE) © Hugo Fortunato
