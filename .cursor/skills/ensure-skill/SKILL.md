---
name: ensure-skill
description: >-
  Creates a project skill from existing ticketing-system code when a domain has
  no skill yet. Use during Principal Engineer design, when implementing a new
  area (reservations, Redis holds, sessions), or when no matching skill exists
  under .cursor/skills/.
---

# Criar skill se faltar

Só o Principal Engineer (ou o Hugo pedindo documentação) cria skill. Programmer e QA não.

## Quando

1. Liste `.cursor/skills/` (hoje: `tech-stack`, `create-solid-use-case`, `k6-baseline`, `search-cdc`, `code-review`, `ensure-skill`).
2. A tarefa toca um domínio **sem** skill (ex.: reservas SOLID, hold Redis, mapa de assentos).
3. O padrão **já existe no repo**. Extraia; não projete arquitetura nova na skill.

Não crie skill “por precaução” nem genérica (`utils`, `helper`).

## Como

Diretório `.cursor/skills/<nome>/SKILL.md`:

```yaml
---
name: kebab-case-max-64
description: WHAT the skill does. Use when WHEN (termos de gatilho).
---
```

- `description` em terceira pessoa, WHAT + WHEN
- Corpo com menos de 500 linhas; só o que este repo faz de diferente
- Sem `disable-model-invocation` se o agent deve descobrir o domínio
- Sem paths Windows; referências só um nível abaixo do `SKILL.md`

## Conteúdo

1. Paths reais.
2. Regras que quebram se ignoradas (unique de assento, TTL, `SEARCH_ENGINE`).
3. Um exemplo mínimo do código atual, não de tutorial externo.

Depois: cite a skill no desenho do PE.
