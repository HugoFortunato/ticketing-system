# Monitoring — protocolo de baseline

Os testes **sem Redis** e **com Redis** devem ser idênticos para a comparação ser válida.

## Pastas

| Pasta | Quando usar |
| --- | --- |
| `without-redis/` | V1 (PostgreSQL puro). Já preenchida em 2026-08-26. |
| `with-redis/` | V2+. Copiar a mesma estrutura de arquivos após rodar os mesmos scripts. |
| `without-es/` | V3 pesquisa no Postgres (`ILIKE`). |
| `with-es/` | V3 pesquisa no Elasticsearch (CDC quente). |

## Testes

| Arquivo | Script k6 | Endpoint |
| --- | --- | --- |
| `events.md` | `load-tests/events.js` | `GET /events` |
| `event-detail.md` | `load-tests/events.js` com `TARGET=detail` | `GET /events/:id` |
| `seats.md` | `load-tests/seats.js` | `GET /sessions/:sessionId/seats` |
| `reservations.md` | `load-tests/reservations.js` | `GET seats` + `POST /sessions/:sessionId/reservations` |
| `search.md` | `load-tests/search.js` | `GET /search?q=` |

JSON bruto do k6: `raw/<teste>-<VUs>.json`.

## Como repetir (Redis)

```bash
export PATH="$HOME/.local/bin:$PATH"

# duração e cargas iguais às da V1
DURATION=20s
OUT=monitoring/with-redis/raw
mkdir -p "$OUT"

for vus in 10 50 100 500 1000; do
  k6 run -e VUS="$vus" -e DURATION="$DURATION" \
    --summary-export="$OUT/events-${vus}.json" \
    load-tests/events.js
done

for vus in 10 50 100 500 1000; do
  k6 run -e TARGET=detail -e VUS="$vus" -e DURATION="$DURATION" \
    --summary-export="$OUT/event-detail-${vus}.json" \
    load-tests/events.js
done

for vus in 10 50 100 500 1000; do
  k6 run -e VUS="$vus" -e DURATION="$DURATION" \
    --summary-export="$OUT/seats-${vus}.json" \
    load-tests/seats.js
done

# re-seed antes de cada carga de reserva (inventário limpo)
for vus in 10 50 100 500 1000; do
  pnpm db:seed
  k6 run -e VUS="$vus" -e DURATION="$DURATION" \
    --summary-export="$OUT/reservations-${vus}.json" \
    load-tests/reservations.js
done

# pesquisa (Postgres ou ES, conforme SEARCH_ENGINE)
for vus in 10 50 100 500 1000; do
  k6 run -e VUS="$vus" -e DURATION="$DURATION" \
    --summary-export="$OUT/search-${vus}.json" \
    load-tests/search.js
done
```

## Condições da baseline V1

- Data: 2026-08-26
- Máquina: WSL2, 8 vCPU, 7.7 GiB RAM
- k6 v0.57.0
- API: Fastify em `http://localhost:3000`
- Banco: PostgreSQL 16 (Docker), sem cache
- Duração: **20s** por carga
- VUs: 10, 50, 100, 500, 1000
- Sessão das reservas/assentos: `44444444-4444-4444-a444-444444444441`

No WSL o relógio às vezes salta. Prefira **mediana e p95** quando `max` ou `avg` aparecerem na casa de minutos.
