# Playwright report

- Comando: `pnpm test:e2e` (Chromium instalado nesta máquina)
- Cenários:
  - home, detalhe + `x-user-id`, sessão, mapa + hold PENDING, seed 403, rotas fake
- Pass / fail: **6 passed**
- Dívida (rotas `modules/` 404 na UI): GET tickets ainda off; o teste fake de `/tickets/:id` continua a aceitar erro live.
