# Docs

| Arquivo | Conteúdo |
| --- | --- |
| [images/architecture.png](images/architecture.png) | System design alvo (Gateway, serviços, Redis, Elasticsearch, Debezium, Kafka) |
| [../specs/ticketing-system-plan-v1.md](../specs/ticketing-system-plan-v1.md) | Spec original da V1 (histórica; stack Next/Nest **não** é a actual) |
| [specs/_template.md](specs/_template.md) | Template de spec por feature (`SPEC_DRAFT` → `SPEC_READY`) |
| [../.ai/README.md](../.ai/README.md) | Workflow spec-driven e evidência de runs |
| [../monitoring/README.md](../monitoring/README.md) | Protocolo de baseline k6 |
| [../monitoring/without-redis/](../monitoring/without-redis/) | Relatórios **sem Redis** (V1) |
| [../monitoring/with-redis/](../monitoring/with-redis/) | Relatórios **com Redis** (V2) |
| [../monitoring/without-es/](../monitoring/without-es/) | Relatórios **pesquisa no Postgres** (V3) |
| [../monitoring/with-es/](../monitoring/with-es/) | Relatórios **pesquisa no Elasticsearch** (V3) |

A apresentação do projeto (objetivos, diagrama, como rodar, tabelas) está no [README da raiz](../README.md).
