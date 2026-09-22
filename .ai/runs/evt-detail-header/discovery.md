# Discovery — evt-detail-header

## Comportamento actual

- Live em `app.ts`: só `@http/routes.ts` — `POST /events`, `GET /events`, `GET /events/:id`, `/health`. `GET /users` **não** está registado.
- `GET /events/:id` exige header `x-user-id` (`getUserId`). Sem header → 401.
- Use case: se `event.userId !== userId` → `ForbiddenError` (controller 403). Eventos do seed têm `userId` null → qualquer header falha o `!==`.
- `POST /events` grava `userId: "1111111"` (sete uns), **não** o UUID da Ana no seed (`11111111-1111-4111-a111-111111111111`).
- Web: `api.getEvent(id)` **não** passa `userId` ao `request()`. Reservas já passam. `EventPage` não usa `useUser()`.
- `VITE_DEFAULT_USER_ID` no `.env.example` é o UUID da Ana. O select de utilizador fica vazio porque `listUsers` dá 404.

## Ficheiros hipotéticos

- `apps/web/src/api/client.ts` — `getEvent(id, userId)`
- `apps/web/src/pages/EventPage.tsx` — `useUser()`
- Playwright `apps/web/e2e/screens.spec.ts` (detalhe)
- Possível: `create-event.ts` MOCK id, `.env.example` — **só se o humano alinhar IDs**
- API get-event use case: **só se** mudarmos a regra para `userId` null

## Regras já no código

- Catálogo `GET /events` é público (sem header).
- Detalhe autenticado + só autor (`userId` do evento igual ao header).
- Sem header: 401. Não autor / autor null: 403.

## Ambiguidades (Product pergunta)

1. Eventos sem autor (seed): manter 403 no detalhe, ou outra regra?
2. Autor mock `"1111111"` vs Ana UUID no default da web: alinhar, ou o humano escolhe o id à mão?
3. Select de utilizador vazio (`GET /users` down): em âmbito desta task?

## Dívida fora de âmbito

- `modules/` comentados; search/seats/reservas 404; `critical-flows` a vermelho; pesquisa na home.
