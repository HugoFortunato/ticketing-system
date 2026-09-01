# Com Redis

Relatórios da V2 (cache na listagem e no detalhe de eventos). Assentos e reservas ainda sem Redis.

| Arquivo | Estado |
| --- | --- |
| `events.md` | Preenchido em 2026-08-28. Mesmo k6 que `../without-redis/events.md`. |
| `event-detail.md` | Preenchido em 2026-09-01. Mesmo k6 que `../without-redis/event-detail.md`. |
| `seats.md` | Ainda não. |
| `reservations.md` | Ainda não. |
| `raw/events-*.json` | Sumários k6 do `GET /events`. |
| `raw/event-detail-*.json` | Sumários k6 do `GET /events/:id`. |

Compare mediana, p95 e req/s com as pastas `../without-redis/`.
