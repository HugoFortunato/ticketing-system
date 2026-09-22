# Discovery

Antes de spec ou código: inspeciona o que **está** no repo.

## Obrigatório

- `apps/api/src/app.ts` — que rotas estão registadas
- `apps/api/src/@http/routes.ts` vs `src/modules/`
- Contratos `@repositories`, use cases
- `apps/web` se o pedido for UI
- `apps/api/test/critical-flows.test.ts` — o que o teste espera vs API actual
- `docs/`, `specs/ticketing-system-plan-v1.md` (V1 histórica; Next/Nest **não** é a stack)
- Skills: `tech-stack`; domínio: `create-solid-use-case` / `search-cdc` / `k6-baseline`

## Output

`.ai/runs/<TASK-ID>/discovery.md`:

- Comportamento actual
- Ficheiros tocados em hipótese
- Regras já no código
- Ambiguidades de produto (lista; Product pergunta)
- Dívida que **não** é desta tarefa (`modules/` comentados, testes vermelhos herdados)

Não inventes endpoints desligados como se estivessem live.
