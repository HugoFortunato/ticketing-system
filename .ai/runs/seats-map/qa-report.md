# QA

- `pnpm --filter api test`: 11 passed (incl. GET seats 200/404).
- Smoke HTTP: `GET /sessions/2498cfea-23a3-482b-8d38-1f05ea888fcc/seats` → 200, 192 assentos `available`.
- Playwright: não correu (binário Chromium em falta neste ambiente). Verificar no browser: `/sessions/<id>/seats`.
