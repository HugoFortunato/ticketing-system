# Plan — evt-detail-header

## Ordem

1. Alinhar `MOCK_AUTHOR_USER_ID` ao UUID da Ana.
2. Web: `getEvent(id, userId?)` + `EventPage` lê `useUser()`.
3. Playwright: header no detalhe + feliz com POST create.
4. `tsc` web + `pnpm test:e2e`.

## Ficheiros

- `apps/api/src/@use-cases/events/create-event.ts`
- `apps/web/src/api/client.ts`
- `apps/web/src/pages/EventPage.tsx`
- `apps/web/e2e/screens.spec.ts`

## Não mexer

- Use case `get-event` (403 no seed mantém-se).
- `GET /users`, `modules/`, listagem.

## Testes

- Playwright obrigatório. Vitest API não.
- Riscos: eventos antigos com `"1111111"`; home continua a clicar em seed → 403 (esperado).
