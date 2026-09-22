# Spec: Madureza do lab (sessões, testes, CI, erros, só Prisma)

Status: `SPEC_READY`  
TASK-ID: `lab-maturity`  
Data: 2026-09-21

## Context

Live hoje: `POST/GET /events`, `GET /events/:id` em `@http`. `modules/*` comentados em `app.ts`. Drizzle opcional via `EVENTS_ORM`. `critical-flows.test.ts` cobre rotas desligadas. Sem CI. Erros SOLID (`EventNotFoundError`) e `AppError`/Prisma no plugin não são o mesmo mapa; `P2025` (venue em falta) vira 500. Sem auth nova (decisão humana).

## Goal

Deixar um caminho de código (Prisma + sessões extraídas), provas no recorte vivo, CI, e status HTTP coerentes.

## User Story

Como quem mantém o lab, quero o recorte ligado testável e um único ORM, para o projecto poder crescer sem Drizzle nem testes fantasma.

## Requirements

- [ ] Extrair sessões: `POST /events/:eventId/sessions` e `GET /sessions/:id` em `@http` / `@use-cases` / Prisma. Não reactivar `modules/sessions` nem `modules/events` para o mesmo verbo.
- [ ] Vitest só no recorte live (eventos + sessões). Fluxos de assentos/reservas/search HTTP ficam skip ou ficheiro legado.
- [ ] Playwright: detalhe com sessão criada visível (além dos cenários de header já existentes).
- [ ] CI: `tsc` api+web, vitest live, Playwright smoke.
- [ ] Erros de domínio → status HTTP (tabela abaixo). Plugin sem Prisma.
- [ ] Remover Drizzle, `EVENTS_ORM`, `chooseRepository`, pacotes `drizzle-orm` / `drizzle-kit` / `postgres`.
- [ ] Sem trabalho de auth (`MOCK_AUTHOR_USER_ID` e `x-user-id` no get mantêm-se).

## Business Rules

- Create event: `venueId` inexistente → 404 `VENUE_NOT_FOUND` (não 500).
- Get event: sem `x-user-id` → 401; evento inexistente → 404; `userId` do evento ≠ header → 403; seed com `userId` null → 403 (spec `evt-detail-header`).
- Create session: evento inexistente → 404; datas inválidas ou `endsAt <= startsAt` → 400; `venueId` (body ou do evento) inexistente → 404.
- Get session: inexistente → 404.
- Envelope: `{ event }`, `{ events }`, `{ session }` (como eventos).
- Create session: `venueId` opcional; default = venue do evento (código legado `createSession`).
- Sem JWT / sem mudar o mock do autor.

## Acceptance Criteria

- [ ] `POST /events` com venue UUID inexistente → 404, body com `error` e `message`.
- [ ] `GET /events/:id` sem header → 401; id inexistente + header → 404; header ≠ autor → 403.
- [ ] `POST /events/:eventId/sessions` com `{ startsAt, endsAt }` ISO válidos → 201 `{ session }` (`eventId`, `venueId`, `startsAt`, `endsAt`).
- [ ] `POST /events/:eventId/sessions` com `endsAt` ≤ `startsAt` → 400.
- [ ] `GET /sessions/:id` existente → 200 `{ session }`; inexistente → 404.
- [ ] `pnpm --filter api test` passa sem exigir rotas de reservas/search.
- [ ] Playwright: após criar evento+sessão como Ana, o detalhe mostra o horário da sessão.
- [ ] CI no GitHub Actions corre tsc + vitest + e2e.
- [ ] Não resta import `drizzle-orm` / `EVENTS_ORM` no código da API.

## Edge Cases

- Venue no body da sessão diferente do evento, mas existente: aceite (legado).
- Body Zod inválido → 400 `VALIDATION_ERROR`.

## Non-Goals

- Auth real, reservas, assentos, ingressos, search HTTP, cache Redis no recorte SOLID, extrair mais agregados, k6.

## Testing Expectations

- `pnpm --filter api exec tsc --noEmit`
- `pnpm --filter web exec tsc --noEmit`
- `pnpm --filter api test`
- `pnpm test:e2e` (home, header 403 seed, detalhe com sessão)
