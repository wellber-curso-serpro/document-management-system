---
title: "ADR-0002: Armazenamento Local em Filesystem"
status: "Accepted"
date: "2026-08-05"
authors: "Equipe DMS (Arquitetura, Backend, Operacao)"
tags: ["architecture", "decision", "storage", "backend"]
supersedes: ""
superseded_by: ""
---

## Status

**Accepted**

## Context

O DMS precisa armazenar arquivos enviados e metadados associados (id, nome, tamanho, data, dono) para atender upload, listagem e download. Nesta fase, o objetivo e simplicidade operacional e baixo custo cognitivo.

Ha uma restricao explicita de produto: uso de armazenamento local da aplicacao com `multer` e `diskStorage`, sem provedores externos. Tambem e necessario manter configuracao orientada a ambiente para testes e execucao local.

## Decision

Armazenar binarios no filesystem local em diretorio configuravel (`STORAGE_DIR`, com fallback para `backend/storage`) e manter metadados em memoria no processo da aplicacao.

Essa decisao reduz dependencia externa, acelera desenvolvimento inicial e simplifica depuracao, mantendo a porta aberta para migracao posterior sem alterar contrato HTTP.

## Consequences

### Positive

- **POS-001**: Setup local rapido, sem dependencia de servicos terceiros.
- **POS-002**: Upload/download com baixa latencia em ambiente de desenvolvimento.
- **POS-003**: Custo operacional inicial minimo para demonstracao e aprendizagem.
- **POS-004**: Variavel `STORAGE_DIR` facilita isolamento de testes de integracao.

### Negative

- **NEG-001**: Metadados em memoria nao sobrevivem a reinicio do processo.
- **NEG-002**: Escalabilidade horizontal limitada por armazenamento local nao compartilhado.
- **NEG-003**: Ausencia de redundancia aumenta risco de perda de dados em falha de disco.
- **NEG-004**: Politicas de backup, retencao e observabilidade ainda nao estao implementadas.

## Alternatives Considered

### Persistencia em Banco Relacional + Objeto Externo

- **ALT-001**: **Description**: Usar banco SQL para metadados e object storage para binarios.
- **ALT-002**: **Rejection Reason**: Maior custo de operacao e complexidade para fase inicial.

### Banco de Dados Embedded para Metadados

- **ALT-003**: **Description**: Introduzir SQLite para metadados mantendo binarios locais.
- **ALT-004**: **Rejection Reason**: Embora simples, ainda adiciona migracoes e governanca prematuras.

### Nao Persistir Arquivos (Opcao "Do Nothing")

- **ALT-005**: **Description**: Manter apenas fluxo em memoria sem gravacao em disco.
- **ALT-006**: **Rejection Reason**: Nao atende requisito funcional de download consistente.

## Implementation Notes

- **IMP-001**: Geracao de nome fisico deve manter unicidade por timestamp + UUID.
- **IMP-002**: Diretorio de armazenamento deve ser criado com `recursive: true` na inicializacao.
- **IMP-003**: Testes devem apontar `STORAGE_DIR` para pastas temporarias e limpar ao final.
- **IMP-004**: Planejar ADR futura para persistencia duravel de metadados antes de producao.

## References

- **REF-001**: Configuracao de storage em [backend/src/routes/documentRoutes.js](../../backend/src/routes/documentRoutes.js).
- **REF-002**: Modelo de metadados em [backend/src/services/documentService.js](../../backend/src/services/documentService.js).
- **REF-003**: Repositorio em memoria em [backend/src/repositories/documentRepository.js](../../backend/src/repositories/documentRepository.js).
- **REF-004**: Relacionado a [docs/adr/adr-0001-layered-backend-architecture.md](adr-0001-layered-backend-architecture.md).
