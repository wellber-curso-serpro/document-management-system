---
title: "ADR-0004: Roadmap de Evolucao de Persistencia"
status: "Proposed"
date: "2026-08-05"
authors: "Equipe DMS (Arquitetura, Backend, Operacao, Produto)"
tags: ["architecture", "decision", "roadmap", "persistence"]
supersedes: ""
superseded_by: ""
---

## Status

**Proposed**

## Context

A persistencia atual atende ao escopo inicial, com arquivos em filesystem local e metadados em memoria. Essa abordagem favorece simplicidade, mas apresenta limitacoes para continuidade operacional, escalabilidade e resiliencia.

Os principais drivers para evolucao sao:

- Necessidade de sobrevivencia dos metadados a reinicios.
- Necessidade de escalabilidade horizontal com multiplas instancias.
- Necessidade de controles de backup, retencao e recuperacao.
- Necessidade de observabilidade e rastreabilidade de falhas de I/O.

## Decision

Adotar um roadmap incremental de evolucao da persistencia em tres fases, preservando o contrato HTTP existente:

- Fase 1: Migrar metadados de memoria para banco relacional (preferencialmente PostgreSQL).
- Fase 2: Introduzir armazenamento de objetos para binarios (S3-compatível ou equivalente).
- Fase 3: Adicionar politicas operacionais (backup, retencao, criptografia, monitoracao e trilhas de auditoria).

A decisao privilegia migracao progressiva, baixo risco de regressao e compatibilidade com a arquitetura em camadas ja adotada.

## Consequences

### Positive

- **POS-001**: Metadados persistentes entre reinicios e deploys.
- **POS-002**: Melhor suporte a escalabilidade horizontal e alta disponibilidade.
- **POS-003**: Reducao de risco operacional com backup e estrategia de recuperacao.
- **POS-004**: Melhor visibilidade operacional com metricas e logs estruturados.
- **POS-005**: Base tecnica para requisitos futuros de compliance e auditoria.

### Negative

- **NEG-001**: Aumento de complexidade operacional (banco, storage, credenciais).
- **NEG-002**: Maior custo de infraestrutura e observabilidade.
- **NEG-003**: Necessidade de migracoes de schema e governanca de dados.
- **NEG-004**: Risco de inconsistencias temporarias durante migracao sem estrategia de cutover.

## Alternatives Considered

### Permanecer com Modelo Atual

- **ALT-001**: **Description**: Manter filesystem local + metadados em memoria por tempo indeterminado.
- **ALT-002**: **Rejection Reason**: Nao atende requisitos de durabilidade e crescimento do produto.

### Migracao Big-Bang

- **ALT-003**: **Description**: Trocar metadados e binarios para stack duravel em unica entrega.
- **ALT-004**: **Rejection Reason**: Risco elevado de indisponibilidade e regressao funcional.

### Apenas Banco para Metadados, Sem Mudar Binarios

- **ALT-005**: **Description**: Persistir somente metadados e manter arquivos exclusivamente em disco local.
- **ALT-006**: **Rejection Reason**: Resolve durabilidade parcial, mas nao elimina gargalo de escala e disponibilidade de arquivos.

## Implementation Notes

- **IMP-001**: Introduzir interface de repositorio para metadados com duas implementacoes: memoria (legado) e banco (nova), com chave de feature flag.
- **IMP-002**: Planejar migracao de dados com dupla escrita temporaria e reconciliacao antes do cutover definitivo.
- **IMP-003**: Definir estrategia de nomeacao de objetos para binarios mantendo `id` e `originalName` como referencia de dominio.
- **IMP-004**: Medir sucesso por SLOs: taxa de erro em upload/download, tempo medio de resposta e taxa de recuperacao de backup.
- **IMP-005**: Executar rollout por ambiente (dev -> homologacao -> producao) com criterio de rollback documentado.

## References

- **REF-001**: Decisao de armazenamento atual em [docs/adr/adr-0002-local-filesystem-storage.md](adr-0002-local-filesystem-storage.md).
- **REF-002**: Arquitetura em camadas em [docs/adr/adr-0001-layered-backend-architecture.md](adr-0001-layered-backend-architecture.md).
- **REF-003**: Repositorio atual em [backend/src/repositories/documentRepository.js](../../backend/src/repositories/documentRepository.js).
- **REF-004**: Servico de metadados atual em [backend/src/services/documentService.js](../../backend/src/services/documentService.js).
