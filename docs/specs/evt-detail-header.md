# Spec: detalhe do evento com x-user-id na web

Status: `SPEC_READY`  
TASK-ID: `evt-detail-header`  
Data: 2026-09-21

## Context

API live: create/list/get de eventos (SOLID). `GET /events/:id` já exige `x-user-id` e só devolve o evento se `event.userId` for igual ao header. A home lista sem auth. A página `/events/:id` chama `getEvent` **sem** header. `GET /users` não está live. Create gravava autor `"1111111"`; o default da web é o UUID da Ana.

## Goal

O detalhe no browser envia o mesmo `x-user-id` que o Insomnia, usando o utilizador actual da app.

## User Story

Como utilizador no site, quero abrir o detalhe de um evento que eu criei e vê-lo, para não depender do Insomnia.

## Requirements

- [ ] `GET /events/:id` a partir da web inclui header `x-user-id` com o `userId` do `UserContext` (localStorage / `VITE_DEFAULT_USER_ID`).
- [ ] Se o header coincidir com `event.userId`, a página mostra nome, descrição, venue e sessões.
- [ ] Mock do create usa o UUID da Ana (`11111111-1111-4111-a111-111111111111`), alinhado ao default da web.
- [ ] Playwright: detalhe envia o header; caminho feliz com evento criado por essa Ana.

## Business Rules

- Sem `x-user-id` → 401. A web **não** inventa header se `userId` do contexto estiver vazio.
- Header ≠ `event.userId` (inclui seed com `userId` null) → **403** (mantém).
- Listagem continua pública.
- `GET /users` / select vazio: **fora de âmbito**. Usa-se o `userId` já no contexto ou env.

## Acceptance Criteria

- [ ] Com `userId` no contexto igual ao autor do evento, o pedido tem `x-user-id` e a UI mostra o `h1` com o nome.
- [ ] Sem `userId` no contexto: sem header; UI de erro (401).
- [ ] Evento seed: com header da Ana → 403 e UI de erro.
- [ ] `pnpm test:e2e` passa.

## Edge Cases

- Select vazio mas `VITE_DEFAULT_USER_ID` ou localStorage preenchido: o header sai na mesma.
- Eventos já criados com `"1111111"`: 403 até recriar.

## Non-Goals

- Reactivar `GET /users`, search, sessões, reservas.
- Catálogo autenticado. JWT. Checkout E2E.

## Testing Expectations

`pnpm --filter web exec tsc --noEmit`, `pnpm test:e2e`. Sem k6. Sem mudança do use case de get.
