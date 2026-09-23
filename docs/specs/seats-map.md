# Spec: Mapa de assentos da sessão

Status: `SPEC_READY`  
TASK-ID: `seats-map`  
Data: 2026-09-23

## Context

Live: eventos, sessões, busca em `@http`. `GET /sessions/:sessionId/seats` existe só em `modules/seats` (desligado). A web já tem `SeatsPage` / `SeatMap` e `api.listSeats`. Criar reserva **não** está live.

Decisões humanas: (1) payload na **raiz**; (2) botão “Criar reserva” **escondido/desactivado**; (3) Playwright do mapa **sim**.

## Goal

Quem abre uma sessão no site vê o mapa de assentos com disponibilidade real, sem passar pelo Insomnia.

## User Story

Como visitante, quero ver os lugares de uma sessão (livres vs ocupados), para escolher onde sentar antes de reservar (reserva = task seguinte).

## Requirements

- [ ] `GET /sessions/:sessionId/seats` live em `@http` / `@use-cases` / Prisma. Não reactivar `modules/seats`.
- [ ] Sessão inexistente → 404 `SESSION_NOT_FOUND`.
- [ ] Sem `x-user-id` (GET público).
- [ ] Antes de montar o mapa: libertar holds expirados (`releaseExpired` no adapter).
- [ ] Assentos = todos os `Seat` do venue da sessão; `CONFIRMED` → `sold`; `PENDING` com row em `ReservationSeat` → `held`; resto → `available`.
- [ ] Resposta **na raiz**: `sessionId`, `event`, `venue`, `startsAt`, `endsAt`, `seats[]` (`id`, `section`, `row`, `number`, `status`).
- [ ] UI: “Selecionar assentos” mostra o mapa. Botão “Criar reserva” não está activo (escondido ou disabled). Sem POST reserva.

## Business Rules

- Unique `(sessionId, seatId)` no `ReservationSeat`; EXPIRED/CANCELLED não mantêm a row.
- Hold expirado no GET deixa de contar como `held`.
- Sem POST reserva nesta spec.

## Acceptance Criteria

- [ ] `GET /sessions/:id/seats` sessão inexistente → 404, `{ error, message }` com `SESSION_NOT_FOUND`.
- [ ] `GET` sessão existente com seats no venue → 200 na raiz, `seats` com `status` ∈ `available|held|sold`.
- [ ] Sem header `x-user-id` → 200 (não 401).
- [ ] Vitest cobre 404 e 200 com pelo menos um `available`.
- [ ] Playwright: Ana cria evento+sessão (venue Arena seed), abre o mapa, vê “Palco” e botões de assento; não vê reserva a submeter.

## Edge Cases

- Sessão nova no mesmo venue do seed: herda os assentos do venue.
- Sem `ReservationSeat`: todos `available`.

## Non-Goals

- `POST` reserva / confirm / cancel / tickets.
- CRUD de venues/seats.
- Auth JWT; mudar regra do detalhe do evento (403 seed).

## Testing Expectations

- `pnpm --filter api exec tsc --noEmit`
- `pnpm --filter web exec tsc --noEmit`
- `pnpm --filter api test`
- `pnpm test:e2e`
