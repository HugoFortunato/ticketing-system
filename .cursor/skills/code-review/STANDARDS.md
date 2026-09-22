# Padrões (review)

## SOLID

Modelo: `createEvent` / `getEvent` em `@use-cases/events/`, `@http/@controllers/`, `@repositories/events-repository.ts`.

Anti-modelo: `apps/api/src/modules/*/service.ts` (legado).

Novo agregado (sessão, reserva, ingresso): contrato `*-repository.ts` próprio + `makeXRepository()` com adapter Prisma.

## HTTP

- 201/200 só no sucesso.
- 400/401/403/404/409 via `UseCaseError` / `AppError` no error-handler.
- Corpo de erro: `{ error, message }`. Sucesso: `{ event }` / `{ events }` / `{ session }`.

## Persistência

`makeXRepository()` instancia Prisma. Não ramificar ORM dentro do use case.

## Cache / busca

- Redis: miss → Postgres → `SET` com TTL; invalidar em escrita.
- ES: indexer consome Debezium; API só faz proxy quando `SEARCH_ENGINE=elasticsearch`.
