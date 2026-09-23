---
name: create-solid-use-case
description: >-
  Scaffolds Fastify use cases in the ticketing API using SOLID ports and adapters
  (controller, use case, repository interface, Prisma adapter, factory).
  Use when creating or extracting a use case: createEvent, getEvent, listEvents,
  updateEvent, deleteEvent, sessions, reservations, tickets, or the @use-cases /
  @http / @repositories pattern.
---

# Criar use case (SOLID)

Receita para casos em `apps/api`. Espelha **eventos**. Não copies `modules/*/service.ts`.

## Camadas

| Camada | Pasta | ORM? |
| --- | --- | --- |
| HTTP | `src/@http/@controllers/` | Não |
| Use case | `src/@use-cases/<agregado>/` | Não |
| Erros | `src/@use-cases/errors/` | Não |
| Contrato | `src/@repositories/*-repository.ts` | Não |
| Adapter | `src/@repositories/prisma/` | Sim |
| Factory repo | `src/@use-cases/factories/make-*-repository.ts` | Instancia Prisma |
| Factory UC | no próprio ficheiro do use case (`makeGetSearchUseCase`, etc.) | Não |

Imports ESM: `.js` (nunca `.ts`). NodeNext.

## Agregados

| Domínio | Contrato | Use cases (pasta) | Espelhar |
| --- | --- | --- | --- |
| Eventos | `events-repository.ts` | `@use-cases/events/` | `create-event`, `get-event` |
| Sessões | `sessions-repository.ts` (criar) | `@use-cases/sessions/` | mesmo recorte: HTTP → UC → repo |
| Reservas | `reservations-repository.ts` (criar) | `@use-cases/reservations/` | unique `(sessionId, seatId)` no adapter; 409 no domínio |
| Ingressos / assentos | `seats-repository.ts` | `@use-cases/seats/` | `list-session-seats`; tickets à parte |

Um contrato por agregado. Não inchir `EventsRepository` com `createReservation`.

## Passos

1. Estender ou criar o contrato (tipos de domínio + método). Sem Prisma.
2. Implementar o método no adapter Prisma; mapear ORM → domínio só ali.
3. Use case: construtor recebe a **interface**; `execute`; `throw` `UseCaseError` em `@use-cases/errors/`.
4. `makeXRepository()` em `factories/` → `new PrismaXRepository()`. No ficheiro do use case: `makeXUseCase()` chama essa factory e `new XUseCase(repo)`.
5. Controller importa `makeXUseCase` **do use case**; Zod em `body`/`params`; erros de domínio sobem ao error-handler. **Nunca 2xx em falha**.
6. Registar em `@http/routes.ts`. Não reativar `modules/events/routes.ts` para o mesmo verbo se a fatia já está em `@http`.
7. `pnpm --filter api exec tsc --noEmit`.

## Referência viva

- Create: `@http/@controllers/create-event.ts`, `@use-cases/events/create-event.ts`
- Get: `@http/@controllers/get-event.ts`, `@use-cases/events/get-event.ts`, `findById`
- Sessão: `create-session`, `get-session`

Resposta HTTP: `{ event }` (ou lista). Cache Redis, se existir, fica no adapter ou num decorator de aplicação — **não** no controller HTTP cru, salvo header `X-Cache` depois do use case.

## Reservas (quando chegar a vez)

- Overselling: unique no banco; use case traduz violação → erro de domínio 409.
- Expiração lazy / Redis TTL: não espalhar `prisma` no use case; porta no repositório (`releaseExpired`, `createHold`, …).
