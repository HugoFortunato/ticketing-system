# Base de dados

Obrigatório no plano e na implementação **sempre que** o diff tocar:

- `apps/api/prisma/schema.prisma` (modelos / enums / índices)
- `apps/api/prisma/migrations/`
- `apps/api/prisma/seed.ts`

## Schema / modelos

1. Escreve a migration Prisma (não deixes o schema à frente da pasta `migrations/`).
2. Corre:

```bash
pnpm db:migrate
```

(dev: `prisma migrate dev`; ambiente já migrado: `pnpm --filter api exec prisma migrate deploy`.)

3. `pnpm --filter api exec prisma generate` (o `postinstall` já gera; corre se o client ficar desactualizado).

Sem este passo a task **não fecha**.

## Seed

Se alteraste `seed.ts`:

```bash
pnpm db:seed
```

Diz no `plan.md` e no `implementation.md` se o humano precisa de `db:reset` (seed não é sempre idempotente).

## Só dados, sem schema

Mudar um UUID no use case (ex. mock do autor) **não** é migration. Linhas antigas na BD ficam com o valor velho até recriar/seed.
