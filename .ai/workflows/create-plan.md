# Create plan

Principal Engineer. Spec em `SPEC_READY`. **Não** implementes.

1. Lê a spec. Não redefinas requisitos; spec oca → devolve ao Product.
2. Skills: `tech-stack` + domínio. `ensure-skill` só com padrão **já** no repo.
3. `.ai/runs/<TASK-ID>/plan.md`: ficheiros, ordem (API antes de UI se a rota não existir), Prisma se o contrato mudar, testes, riscos, o que **não** mexer.
4. Se a spec/plano mexer em **modelos Prisma, migrations ou `seed.ts`**: inclui `.ai/workflows/database.md` (`pnpm db:migrate` e/ou `pnpm db:seed`). Sem isso o plano está incompleto.
5. Para.

Estado: `PLAN_READY`.
