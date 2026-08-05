---
title: "ADR-0003: Integracao Frontend via Prefixo /api"
status: "Accepted"
date: "2026-08-05"
authors: "Equipe DMS (Arquitetura, Frontend, Backend)"
tags: ["architecture", "decision", "frontend", "integration"]
supersedes: ""
superseded_by: ""
---

## Status

**Accepted**

## Context

O frontend React precisa consumir endpoints do backend (`/upload`, `/documents`, `/documents/:id/download`) durante desenvolvimento local sem acoplamento ao host/porta do servidor.

Tambem e necessario evitar duplicacao de chamadas `fetch` e padronizar tratamento de erro na camada cliente, mantendo componentes focados em estado e apresentacao.

## Decision

Adotar prefixo `/api` no frontend e configurar proxy no Vite para reescrever `/api/*` para o backend local (`http://localhost:3000/*`). Centralizar chamadas HTTP em um cliente de API dedicado no frontend.

Essa decisao desacopla componentes de detalhes de ambiente, reduz repeticao de codigo e simplifica futura troca de estrategia de roteamento/rede.

## Consequences

### Positive

- **POS-001**: Evita hardcode de host e porta em componentes React.
- **POS-002**: Reduz duplicacao de logica HTTP com cliente unico de API.
- **POS-003**: Padroniza mensagens de erro e fluxo de excecao.
- **POS-004**: Mantem componentes funcionais focados em hooks e UI.

### Negative

- **NEG-001**: Dependencia do proxy de desenvolvimento pode mascarar problemas de CORS em outros ambientes.
- **NEG-002**: Download via blob em memoria pode ser custoso para arquivos muito grandes.
- **NEG-003**: Prefixo fixo exige alinhamento com configuracoes de deploy em producao.

## Alternatives Considered

### Chamadas Diretas para URL Absoluta do Backend

- **ALT-001**: **Description**: Usar `http://localhost:3000` diretamente em cada `fetch`.
- **ALT-002**: **Rejection Reason**: Acoplamento alto ao ambiente e maior risco de duplicacao.

### Cliente HTTP Externo (Axios)

- **ALT-003**: **Description**: Introduzir biblioteca externa para interceptors e conveniencias.
- **ALT-004**: **Rejection Reason**: Nao necessario na fase atual; `fetch` nativo atende ao escopo.

### BFF Dedicado para Frontend (Opcao "Do Nothing" no Cliente)

- **ALT-005**: **Description**: Criar camada intermediaria extra para orquestrar chamadas.
- **ALT-006**: **Rejection Reason**: Complexidade adicional sem ganho proporcional no momento.

## Implementation Notes

- **IMP-001**: Todos os endpoints do frontend devem usar o cliente em `src/services`.
- **IMP-002**: Erros HTTP devem ser convertidos em mensagens padronizadas no cliente de API.
- **IMP-003**: Em producao, definir estrategia equivalente ao proxy para manter contrato `/api`.
- **IMP-004**: Validar upload/listagem/download em smoke tests de integracao apos mudancas de rede.

## References

- **REF-001**: Proxy Vite em [frontend/vite.config.js](../../frontend/vite.config.js).
- **REF-002**: Cliente de API em [frontend/src/services/documentApi.js](../../frontend/src/services/documentApi.js).
- **REF-003**: Integracao de estado em [frontend/src/App.jsx](../../frontend/src/App.jsx).
- **REF-004**: Relacionado a [docs/adr/adr-0001-layered-backend-architecture.md](adr-0001-layered-backend-architecture.md).
- **REF-005**: Relacionado a [docs/adr/adr-0002-local-filesystem-storage.md](adr-0002-local-filesystem-storage.md).
