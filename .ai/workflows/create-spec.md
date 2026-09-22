# Create spec

Product Agent. Template: `docs/specs/_template.md`.

1. Discovery feito.
2. Não copies exemplos de cancelamento/booking de outros produtos.
3. Se faltar decisão de negócio → pergunta; fica `SPEC_DRAFT`.
4. Escreve `docs/specs/<feature>.md` (kebab-case).
5. No run, `spec.md` só aponta para `docs/specs/<feature>.md` (não dupliques o texto).
6. Critérios de aceitação **testáveis** (API status, body, header, UI visível).
7. Testing Expectations: `tsc`, vitest do recorte, k6 se carga. UI: Playwright (`pnpm test:e2e`).

Humano escreve “spec ok” / `SPEC_READY`. Só então o PE planeia.
