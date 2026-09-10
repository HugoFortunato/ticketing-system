# Padrões (review)

## SOLID

Modelo: `createEvent` / `getEvent` em `@use-cases/events/`, `@http/@controllers/`, `@repositories/events-repository.ts`.

Anti-modelo: `apps/api/src/modules/*/service.ts` (legado).

Novo agregado (sessão, reserva, ingresso): contrato `*-repository.ts` próprio + `makeXRepository()` com `chooseRepository({ prisma, drizzle })`. Os dois adapters no mesmo commit se o método for novo.

## HTTP

- 201/200 só no sucesso.
- 404/409 via classes em `@use-cases/errors/`.
- Corpo alinhado: `{ event }` (ou lista).

## Persistência

`chooseRepository` lê `env.EVENTS_ORM`. Não ramificar `if (prisma)` dentro do use case.

## Cache / busca

- Redis: miss → Postgres → `SET` com TTL; invalidar em escrita.
- ES: indexer consome Debezium; API só faz proxy quando `SEARCH_ENGINE=elasticsearch`.
