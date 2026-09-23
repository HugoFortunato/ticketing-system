# QA report

- Spec / critérios: `docs/specs/reservations.md` recorte A
- Playwright (`pnpm test:e2e`, se UI): 6/6
- Resultado por critério:
  - POST Ana + seatIds → 201 PENDING: **pass** (vitest)
  - POST sem `x-user-id` → 401: **pass**
  - segundo POST mesmo assento → 409 CONFLICT: **pass**
  - POST sessão inexistente → 404 SESSION_NOT_FOUND: **pass**
  - GET id inexistente → 404 RESERVATION_NOT_FOUND: **pass**
  - GET sem header → 200: **pass**
  - Vitest cobre os casos: **pass** (13 testes)
  - Playwright mapa → Criar reserva → heading Reserva + PENDING: **pass**
- Dívida herdada (não bloqueia esta spec): confirm/cancel HTTP; GET `/tickets/:id`; `modules/reservations` comentado.
- Veredito: PASS
