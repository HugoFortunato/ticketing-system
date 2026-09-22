# QA

Spec `lab-maturity`: critérios de API exercitados em vitest; UI sessão em Playwright.

| Critério | Resultado |
| --- | --- |
| POST venue 404 | pass |
| GET 401/403/404 | pass |
| POST/GET session | pass |
| endsAt ≤ startsAt 400 | pass |
| vitest só live | pass (9) |
| Playwright sessão | pass |
| Sem drizzle na API | pass |
| CI workflow presente | pass (não corrido no GitHub) |

`tsc` api+web OK. Dívida: reservas/search ainda em `modules/`.
