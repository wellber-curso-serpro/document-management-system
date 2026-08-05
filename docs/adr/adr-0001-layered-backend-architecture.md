---
title: "ADR-0001: Arquitetura em Camadas no Backend"
status: "Accepted"
date: "2026-08-05"
authors: "Equipe DMS (Arquitetura, Backend, Frontend)"
tags: ["architecture", "decision", "backend", "clean-architecture"]
supersedes: ""
superseded_by: ""
---

## Status

**Accepted**

## Context

O backend do DMS precisa suportar upload, listagem e download de documentos de forma simples, legivel e evolutiva. O projeto adota JavaScript puro com Node.js e Express, sem TypeScript nesta fase, e prioriza KISS, YAGNI e separacao clara de responsabilidades.

As principais forcas que influenciam esta decisao sao:

- Necessidade de evoluir o dominio sem acoplamento direto com detalhes HTTP.
- Necessidade de manter testes objetivos em uma base pequena.
- Restricao de fase inicial: persistencia simples e sem overengineering.

## Decision

Adotar arquitetura em camadas no backend com fluxo de dependencia unidirecional:

- `routes` delega para `controllers`.
- `controllers` valida entrada e monta resposta HTTP.
- `services` concentra regras de negocio.
- `repositories` encapsula persistencia.

Essa decisao reduz acoplamento entre protocolo HTTP e regras de negocio, facilita manutencao incremental e preserva legibilidade para equipes em treinamento e onboarding.

## Consequences

### Positive

- **POS-001**: Melhora a separacao de responsabilidades e reduz efeito cascata de mudancas.
- **POS-002**: Facilita testes por camada, com foco em regras de negocio no nivel de servicos.
- **POS-003**: Permite trocar detalhes de persistencia com baixo impacto nas rotas.
- **POS-004**: Aumenta clareza arquitetural para novos contribuidores.

### Negative

- **NEG-001**: Introduz mais arquivos e indirecao para um escopo funcional pequeno.
- **NEG-002**: Pode gerar sobrecarga de boilerplate em mudancas triviais.
- **NEG-003**: Exige disciplina para manter fronteiras entre camadas ao longo do tempo.

## Alternatives Considered

### Handler Unico por Endpoint

- **ALT-001**: **Description**: Concentrar validacao, regra e persistencia em um unico handler Express por rota.
- **ALT-002**: **Rejection Reason**: Aumenta acoplamento e dificulta evolucao sem regressao.

### Arquitetura Hexagonal Completa

- **ALT-003**: **Description**: Introduzir portas/adaptadores, contratos formais e inversao de dependencia ampla.
- **ALT-004**: **Rejection Reason**: Complexidade desnecessaria para a fase atual do produto.

### Nao Definir Camadas (Opcao "Do Nothing")

- **ALT-005**: **Description**: Manter estrutura ad hoc e deixar organizacao para etapas futuras.
- **ALT-006**: **Rejection Reason**: Risco alto de crescimento desordenado e retrabalho estrutural.

## Implementation Notes

- **IMP-001**: Novos endpoints devem seguir o fluxo `routes -> controllers -> services -> repositories`.
- **IMP-002**: Regras de negocio nao devem depender diretamente de `req` e `res`.
- **IMP-003**: Falhas de validacao e serializacao devem ser tratadas em controllers.
- **IMP-004**: Revisoes de PR devem bloquear violacoes de fronteira entre camadas.

## References

- **REF-001**: Estrutura backend em [backend/src/app.js](../../backend/src/app.js).
- **REF-002**: Rotas e upload em [backend/src/routes/documentRoutes.js](../../backend/src/routes/documentRoutes.js).
- **REF-003**: Controle de entrada/saida HTTP em [backend/src/controllers/documentController.js](../../backend/src/controllers/documentController.js).
- **REF-004**: Regra de negocio em [backend/src/services/documentService.js](../../backend/src/services/documentService.js).
- **REF-005**: Persistencia em memoria em [backend/src/repositories/documentRepository.js](../../backend/src/repositories/documentRepository.js).
