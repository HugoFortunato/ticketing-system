# Discovery

- Comportamento actual: eventos SOLID; sessões só em `modules/` (GET session + POST nested no events service).
- Live vs desligado: app.ts só `@http/routes`.
- Regras já no código: createSession datas; venue default do evento; get event 403 se userId ≠ header.
- Ambiguidades: resolvidas pelo humano (1–6).
- Dívida fora de âmbito: reservas, search, auth.
