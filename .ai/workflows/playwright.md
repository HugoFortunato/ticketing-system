# Playwright (frontend E2E)

Obrigatório quando o plano ou o diff toca `apps/web`.

Primeira vez (Chromium). Neste WSL (Ubuntu 20.04) o runner está em `@playwright/test@1.47.2`.

```bash
pnpm --filter web exec playwright install chromium
pnpm test:e2e
```

Sobe API (`pnpm start` em `apps/api`) e Vite se ainda não estiverem a correr. Precisa de Postgres (Compose) para a home listar eventos.

1. O Programmer corre no fim da implementação UI.
2. O QA volta a correr e anota `playwright-report.md` no run.
3. FAIL → Programmer corrige (máx. 2) → `pnpm test:e2e` de novo.

Os testes em `apps/web/e2e/` exercitam as **telas** (home, detalhe, assentos, reserva, ingresso). Rotas de `modules/` desligadas podem mostrar erro na página — isso é dívida, não skip do Playwright.

Não declares a task FE completa sem este passo.
