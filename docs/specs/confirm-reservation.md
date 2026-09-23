# Spec: Confirmar reserva (ingressos)

Status: `SPEC_READY`  
TASK-ID: `confirm-reservation`  
Data: 2026-09-23

## Context

Hold live. Confirm e GET ticket off. Decisão humana: recorte **A** (POST confirm + GET ticket + botão); dono errado **403**; UI **fica** na página da reserva após confirmar. Cancel fora.

## Goal

Confirmar um hold PENDING e emitir ingressos visíveis na reserva e em `/tickets/:id`.

## User Story

Como titular da reserva (`x-user-id`), quero confirmar o hold para os lugares passarem a vendidos e eu obter ingressos.

## Requirements

- [ ] `POST /reservations/:id/confirm` live em `@http`. Header `x-user-id`. Não reactivar `modules/reservations` nem `modules/tickets`.
- [ ] `GET /tickets/:id` público (sem header). Payload na **raiz**.
- [ ] Confirm: resposta na **raiz** (mesmo shape do GET reserva).
- [ ] PENDING válida → `CONFIRMED` + um `Ticket` por assento.
- [ ] Já `CONFIRMED` → 200 idempotente.
- [ ] Sem header → 401. Inexistente → 404 `RESERVATION_NOT_FOUND`. Dono errado → 403 `FORBIDDEN`. Não PENDING (exceto já CONFIRMED) → 409. Expirada → EXPIRED + libertar `ReservationSeat` + 409.
- [ ] Unique de ticket `(sessionId, seatId)` → 409 `CONFLICT`.
- [ ] UI: “Confirmar e gerar ingressos” activo em PENDING; após sucesso permanece em `/reservations/:id` com CONFIRMED e lista de ingressos. Cancelar continua desactivado.

## Business Rules

- Lazy expiry no confirm (como o legado).
- Idempotência se já `CONFIRMED`.
- Só o `userId` da reserva confirma (403 se outro).
- GET ticket 404 `TICKET_NOT_FOUND`.

## Acceptance Criteria

- [ ] POST confirm Ana + hold PENDING → 200, `status: CONFIRMED`, `tickets.length` = nº de assentos.
- [ ] POST confirm sem `x-user-id` → 401.
- [ ] POST confirm id inexistente → 404 `RESERVATION_NOT_FOUND`.
- [ ] POST confirm com outro `x-user-id` → 403 `FORBIDDEN`.
- [ ] POST confirm segunda vez (já CONFIRMED) → 200, mesmos tickets.
- [ ] POST confirm após expiry → 409; GET reserva mostra `EXPIRED`.
- [ ] GET `/tickets/:id` sem header → 200 com session/seat/user.
- [ ] GET ticket inexistente → 404 `TICKET_NOT_FOUND`.
- [ ] Vitest cobre os casos acima.
- [ ] Playwright: mapa → hold → Confirmar → CONFIRMED + link de ingresso → página “Ingresso confirmado”.

## Edge Cases

- Confirm de CANCELLED → 409.
- Ticket unique (oversell) → 409.

## Non-Goals

- Cancel (`DELETE`).
- JWT.
- Reactivar `modules/`.

## Testing Expectations

- `pnpm --filter api exec tsc --noEmit`
- `pnpm --filter web exec tsc --noEmit`
- `pnpm --filter api test`
- `pnpm test:e2e`
