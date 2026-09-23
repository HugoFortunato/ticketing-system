# Spec: Reservas (hold)

Status: `SPEC_READY`  
TASK-ID: `reservations`  
Data: 2026-09-23

## Context

Mapa live. Reservas off. Decisão humana: recorte **A** (POST + GET + botão); payload **na raiz**; GET **público**; 403 de dono errado **não** entra (não há cancel/confirm nesta task).

## Goal

Segurar assentos a partir do mapa e ver a reserva pendente.

## User Story

Como utilizador da app (`x-user-id`, V1 sem JWT), quero reservar lugares por alguns minutos, para ninguém os levar enquanto não confirmo (confirm = spec seguinte).

## Requirements

- [x] `POST /sessions/:sessionId/reservations` live: header `x-user-id`, body `{ seatIds: string[] }`. Não reactivar `modules/reservations`.
- [x] `GET /reservations/:id` público (sem header).
- [x] Resposta **na raiz** (objecto reserva, não `{ reservation }`).
- [x] Status `PENDING`; `expiresAt` = agora + `RESERVATION_TTL_SECONDS`.
- [x] Unique `(sessionId, seatId)` → 409 `CONFLICT`. Libertação de holds expirados antes do create e no GET.
- [x] Sem header no POST → 401. User inexistente → 400. Sessão inexistente → 404. seatIds vazio / assentos de outro venue → 400.
- [x] UI: botão “Criar reserva” activo com selecção; navega para `/reservations/:id`. Confirm/cancel na página da reserva **desactivados** (rotas ainda off).

## Business Rules

- Dedup de `seatIds` (`Set`), como o legado.
- GET 404 `RESERVATION_NOT_FOUND`.
- Sem confirm, cancel, GET tickets.

## Acceptance Criteria

- [x] POST com Ana + seatIds do venue da sessão → 201, `status: PENDING`, `seats` preenchidos.
- [x] POST sem `x-user-id` → 401.
- [x] Segundo POST no mesmo assento → 409 `CONFLICT`.
- [x] POST sessão inexistente → 404 `SESSION_NOT_FOUND`.
- [x] GET id inexistente → 404 `RESERVATION_NOT_FOUND`.
- [x] GET sem header → 200 se a reserva existe.
- [x] Vitest cobre os casos acima.
- [x] Playwright: mapa → seleccionar lugar → Criar reserva → heading “Reserva” e status PENDING.

## Edge Cases

- IDs duplicados no body: um só hold.
- GET após expiry lazy: reserva pode aparecer `EXPIRED` sem seats (legado corre expiry no GET).

## Non-Goals

- Confirm, cancel, tickets HTTP, JWT, 403 de dono.

## Testing Expectations

- `pnpm --filter api exec tsc --noEmit`
- `pnpm --filter web exec tsc --noEmit`
- `pnpm --filter api test`
- `pnpm test:e2e`
