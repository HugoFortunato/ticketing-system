# Implementation

- `MOCK_AUTHOR_USER_ID` = UUID da Ana.
- `api.getEvent(id, userId?)` envia `x-user-id` só se houver id.
- `EventPage` usa `useUser()`.
- E2E: caminho feliz (create + detalhe) e seed → erro.

De fora: `GET /users`, regra 403 no get-event use case.
