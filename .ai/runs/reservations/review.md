# Review

Checklist SOLID: Fastify; Prisma só no adapter; use case sem ORM; factories repo + `makeXUseCase` no ficheiro UC; rotas em `@http`; payload na raiz; P2002 → 409.

- 🔴 Crítico: nenhum
- 🟡 Sugestão: `PrismaReservationsRepository` lança `SessionNotFoundError` / `InvalidSeatSelectionError` (além de P2002). Aceitável neste recorte; o use case já valida user e seatIds vazios.
- 🟢 Nice to have: extrair confirm/cancel na próxima spec; GET tickets continua 404.
- Veredito: OK
