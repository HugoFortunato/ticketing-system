Quero construir um projeto educacional de System Design baseado em uma plataforma de venda/reserva de ingressos, inspirada conceitualmente em sistemas como Ticketmaster.

O objetivo principal NÃO é criar um clone do Ticketmaster, mas construir uma aplicação realista que possa evoluir progressivamente para uma arquitetura distribuída.

IMPORTANTE: nesta primeira etapa quero implementar SOMENTE a V1.

Não implemente Redis, Kafka, Elasticsearch, Debezium, microservices distribuídos ou qualquer mecanismo de cache nesta etapa.

Quero começar propositalmente com uma arquitetura simples e depois evoluí-la incrementalmente para entender os problemas e os trade-offs.

---

# OBJETIVO DA V1

Construir uma plataforma básica de eventos e reserva de ingressos utilizando:

* Frontend: Next.js + TypeScript
* Backend: NestJS + TypeScript
* Database: PostgreSQL
* ORM: Prisma
* Containerização: Docker / Docker Compose
* Package manager: pnpm
* Load testing: k6

Quero uma estrutura organizada para que posteriormente possamos adicionar Redis, Kafka, Elasticsearch e outros componentes sem precisar reescrever todo o projeto.

---

# ARQUITETURA DA V1

A arquitetura inicial deve ser propositalmente simples:

Frontend
↓
Backend API
↓
PostgreSQL

Não quero Redis nesta fase.

Não quero Kafka nesta fase.

Não quero Elasticsearch nesta fase.

Não quero Debezium nesta fase.

Não quero criar microservices nesta fase.

Podemos estruturar o código pensando em uma futura evolução, mas a aplicação deve funcionar inicialmente como um backend monolítico modular.

---

# ESTRUTURA DO PROJETO

Crie um monorepo utilizando pnpm.

Sugestão:

/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   └── ...
├── prisma/
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md

O frontend deve estar em:

apps/web

O backend deve estar em:

apps/api

O Prisma deve ficar organizado de forma que o schema e migrations sejam facilmente encontrados e gerenciados.

Se você considerar outra estrutura melhor, explique brevemente a decisão antes de implementá-la.

---

# DOMÍNIO

A aplicação será uma plataforma de eventos.

Precisamos inicialmente dos seguintes conceitos:

User
Event
Venue
Seat
Session
Reservation
Ticket

Não crie complexidade desnecessária.

O objetivo é termos um domínio suficientemente realista para posteriormente estudarmos:

* concorrência
* overselling
* caching
* distributed locking
* event-driven architecture
* eventual consistency
* message queues
* read models

---

# BANCO DE DADOS

Utilize PostgreSQL com Prisma.

Modele adequadamente os relacionamentos entre:

User
Event
Venue
Seat
Session
Reservation
Ticket

Considere um cenário como:

Event
↓
Session
↓
Venue
↓
Seat

Uma sessão representa uma apresentação específica de um evento em determinado horário.

Os assentos pertencem ao venue, mas a disponibilidade/reserva deve ser relacionada à sessão.

Pense cuidadosamente no modelo de dados para permitir que posteriormente possamos testar concorrência na reserva de assentos.

IMPORTANTE:

Não implemente Redis ou qualquer mecanismo externo para controlar disponibilidade.

Nesta primeira versão, PostgreSQL será a única fonte de verdade.

Utilize constraints e relacionamentos apropriados no banco.

Crie migrations do Prisma.

Crie também um seed para popular o banco com dados suficientes para desenvolvimento e testes.

---

# BACKEND

Utilize Fastify + TypeScript.

Estruture o backend de maneira modular e organizada, mantendo tudo dentro de uma única aplicação (monolith).

Sugestão de estrutura por domínio:

users
events
venues
sessions
seats
reservations
tickets

Cada domínio deve ser responsável pelas suas próprias rotas, schemas, services e regras de negócio.

Utilize boas práticas como:

DTOs / schemas para validação de entrada
Fastify JSON Schema ou biblioteca de validação adequada
Services para separar regras de negócio das rotas
Repository/data-access layer quando fizer sentido
Prisma para acesso ao PostgreSQL
Tratamento centralizado e adequado de erros
HTTP status codes apropriados
Tipagem forte com TypeScript
Separação clara entre routes, services, schemas e database access
Variáveis de ambiente para configurações sensíveis

Não utilize NestJS.

Não transforme os módulos/domínios em microservices. Tudo deve rodar dentro de uma única aplicação Fastify.

Evite overengineering. A arquitetura deve ser simples o suficiente para permitir evolução posterior, especialmente a introdução de Redis para caching e realização de load testing.

---

# ENDPOINTS

Implemente pelo menos:

## Events

GET /events

GET /events/:id

POST /events

PATCH /events/:id

DELETE /events/:id

## Sessions

GET /sessions/:id

POST /events/:eventId/sessions

## Seats

GET /sessions/:sessionId/seats

## Reservations

POST /sessions/:sessionId/reservations

GET /reservations/:id

DELETE /reservations/:id

## Tickets

GET /tickets/:id

POST /reservations/:reservationId/confirm

Os endpoints podem ser ajustados se houver uma decisão arquitetural melhor, mas mantenha o sistema simples.

---

# RESERVA DE ASSENTOS

Essa é uma parte importante do projeto.

Queremos posteriormente testar concorrência e overselling.

Portanto, implemente uma primeira versão de reserva utilizando somente PostgreSQL.

Uma reserva deve possuir um estado, por exemplo:

PENDING
CONFIRMED
CANCELLED
EXPIRED

Defina também timestamps relevantes.

Exemplo:

createdAt
updatedAt
expiresAt

Nesta primeira versão NÃO utilize Redis para controlar o TTL.

Se houver expiração, implemente da maneira mais simples possível usando PostgreSQL/backend.

O objetivo é justamente termos uma implementação inicial que posteriormente possa ser comparada com uma implementação utilizando Redis.

IMPORTANTE:

Não tente "resolver" antecipadamente todos os problemas de escala.

Queremos que alguns gargalos existam para podermos observá-los durante os testes.

---

# FRONTEND

Crie uma aplicação vite + TypeScript.

O frontend não precisa ser visualmente sofisticado.

Priorize funcionalidade.

Crie pelo menos:

## Home

Lista de eventos.

Mostrar:

* nome
* imagem
* localização
* data
* categoria

## Event Details

Mostrar:

* nome
* descrição
* local
* sessões disponíveis

## Seat Selection

Mostrar os assentos de uma sessão.

Diferenciar:

* disponível
* reservado
* selecionado

Permitir selecionar um ou mais assentos.

## Reservation

Permitir criar uma reserva.

Mostrar o status da reserva.

## Confirmation

Permitir confirmar uma reserva e gerar o ticket.

---

# FRONTEND / BACKEND

O frontend deve consumir a API real.

Não utilize mocks para os fluxos principais.

Quero conseguir:

1. abrir a aplicação
2. visualizar eventos
3. abrir um evento
4. selecionar uma sessão
5. visualizar assentos
6. selecionar assentos
7. criar uma reserva
8. visualizar a reserva
9. confirmar a reserva
10. visualizar o ticket

---

# AUTENTICAÇÃO

Não implemente um sistema complexo de autenticação nesta primeira versão.

Se necessário, podemos utilizar um userId simples para os testes.

O objetivo desta etapa é estudar arquitetura e performance, não autenticação.

---

# DOCKER

Crie um docker-compose para PostgreSQL.

Exemplo conceitual:

PostgreSQL
↓
Backend
↓
PostgreSQL

O projeto deve conseguir subir o banco facilmente.

Documente no README como:

* iniciar o banco
* executar migrations
* executar seed
* iniciar backend
* iniciar frontend

---

# LOAD TESTING

Essa parte é MUITO importante.

Já prepare o projeto para realizarmos testes de carga antes de adicionar Redis.

Utilize k6.

Crie uma pasta:

load-tests/

E pelo menos um script para testar:

GET /events

GET /sessions/:id/seats

POST /sessions/:sessionId/reservations

Comece com cargas pequenas e progressivas.

Por exemplo:

10 usuários
50 usuários
100 usuários
500 usuários
1000 usuários

Não assuma que todos esses números serão suportados.

Queremos descobrir o comportamento real do sistema.

O teste deve permitir configurar facilmente:

* número de VUs
* duração
* endpoint
* sessionId
* userId
* seatId

IMPORTANTE:

O load test deve gerar dados realistas e evitar que todos os requests utilizem exatamente os mesmos dados, quando isso puder distorcer os resultados.

---

# OBSERVABILIDADE DA V1

Antes de adicionar Redis, quero conseguir observar o comportamento do sistema.

Adicione logging suficiente para identificar:

* request
* endpoint
* status code
* duração da requisição
* erros

Não adicione ferramentas complexas de observabilidade nesta fase.

Podemos adicionar Prometheus/Grafana posteriormente.

No README, crie uma seção chamada:

"Baseline Performance"

Explique que a V1 será utilizada como baseline antes da introdução de Redis.

---

# TESTES

Implemente testes básicos para:

* criação de evento
* criação de sessão
* consulta de assentos
* criação de reserva
* confirmação de reserva
* tentativa de reservar assento indisponível

Não precisa criar cobertura exagerada.

Priorize os fluxos críticos.

---

# README

Crie um README explicando:

1. O objetivo do projeto
2. Arquitetura atual
3. Stack utilizada
4. Como executar
5. Estrutura do projeto
6. Modelo de domínio
7. API
8. Como executar migrations
9. Como executar seed
10. Como executar os load tests
11. Baseline de performance
12. Próximas etapas

Na seção "Future Architecture", explique que posteriormente serão adicionados:

V1:
PostgreSQL

V2:
Redis

V3:
Kafka

V4:
Elasticsearch

V5:
Debezium / CDC

Mas NÃO implemente esses componentes agora.

---

# PRINCÍPIO MAIS IMPORTANTE DO PROJETO

Este é um projeto de estudo de System Design.

Portanto, não quero simplesmente uma aplicação "bonita".

Quero uma aplicação que possamos evoluir e medir.

Não tente esconder ou eliminar prematuramente todos os problemas de performance.

A intenção é:

V1
PostgreSQL puro
↓
Load Test
↓
Encontrar gargalos
↓
Medir baseline
↓
Adicionar Redis
↓
Executar exatamente os mesmos testes
↓
Comparar resultados
↓
Entender por que Redis ajudou
↓
Identificar novos problemas
↓
Adicionar Kafka
↓
Adicionar Elasticsearch
↓
Adicionar CDC
↓
Evoluir a arquitetura progressivamente.

---

# REGRAS IMPORTANTES

1. NÃO adicionar Redis.
2. NÃO adicionar Kafka.
3. NÃO adicionar Elasticsearch.
4. NÃO adicionar Debezium.
5. NÃO adicionar microservices.
6. NÃO adicionar Kubernetes.
7. NÃO adicionar cloud providers.
8. NÃO adicionar ferramentas de observabilidade complexas.
9. Não fazer overengineering.
10. Priorizar código simples, legível e fácil de evoluir.
11. Documentar decisões arquiteturais importantes.
12. Se houver mais de uma solução razoável, explique os trade-offs antes de escolher.
13. Não esconda problemas de concorrência que sejam importantes para os próximos experimentos.
14. Não implemente funcionalidades que não sejam necessárias para a V1.

Antes de começar a implementar, apresente:

1. arquitetura proposta
2. estrutura do monorepo
3. modelo de dados
4. principais endpoints
5. fluxo de reserva
6. estratégia de load testing

Depois disso, implemente a V1.
