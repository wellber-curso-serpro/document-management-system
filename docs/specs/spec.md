# Especificação Completa - Document Management System (DMS)

## 1. Objetivo

Entregar um sistema web para gestão de documentos que permita upload, listagem e download de arquivos por usuário, com armazenamento local no backend e metadados em memória na fase inicial.

## 2. Escopo

### Dentro do escopo

- Upload de documentos por usuário.
- Listagem de documentos com metadados.
- Download de documento pelo identificador.
- Validações básicas de entrada na camada HTTP.
- Persistência de arquivo em filesystem local usando `multer` com `diskStorage`.
- Persistência de metadados em memória (in-process).

### Fora do escopo

- Armazenamento externo (S3, GCS, Azure Blob, etc.).
- Banco de dados persistente para metadados.
- Versionamento de documentos.
- Controle avançado de permissões (RBAC/ACL detalhado).
- Busca full-text de conteúdo de arquivos.

## 3. Requisitos funcionais

| ID    | Requisito |
| ----- | --------- |
| RF-01 | O sistema deve permitir que um usuário envie um documento via `multipart/form-data`. |
| RF-02 | O sistema deve gerar um identificador único para cada documento enviado. |
| RF-03 | O sistema deve armazenar fisicamente o arquivo no diretório local `backend/storage`. |
| RF-04 | O sistema deve registrar metadados do documento em memória após upload bem-sucedido. |
| RF-05 | O sistema deve permitir listar documentos com seus metadados. |
| RF-06 | O sistema deve permitir baixar um documento pelo `id`. |
| RF-07 | O sistema deve retornar erro `404` quando o `id` não existir para download. |
| RF-08 | O sistema deve associar cada documento a um `owner` informado no upload. |
| RF-09 | O sistema deve expor endpoint de health check para monitoramento básico. |

## 4. Requisitos não funcionais

| ID     | Requisito |
| ------ | --------- |
| RNF-01 | Backend em Node.js + Express (CommonJS). |
| RNF-02 | Frontend em React + Vite (ESM). |
| RNF-03 | Arquivos obrigatoriamente gravados no filesystem local usando `multer.diskStorage`. |
| RNF-04 | Metadados mantidos em memória nesta fase (sem banco). |
| RNF-05 | Configuração por variáveis de ambiente (12-Factor), incluindo `PORT` e caminhos configuráveis. |
| RNF-06 | Separação por camadas: `routes -> controllers -> services -> repositories` (Clean Architecture simples). |
| RNF-07 | Código em JavaScript puro, sem TypeScript nesta fase. |
| RNF-08 | Tratamento de erros nos limites do sistema (HTTP e I/O). |

## 5. Modelo de dados (metadados do documento)

### Entidade: DocumentMetadata

| Campo         | Tipo   | Obrigatório | Descrição |
| ------------- | ------ | ----------- | --------- |
| id            | string | Sim         | Identificador único do documento (UUID ou equivalente). |
| originalName  | string | Sim         | Nome original do arquivo enviado pelo cliente. |
| storageName   | string | Sim         | Nome do arquivo persistido no disco (gerado pelo servidor). |
| mimeType      | string | Sim         | Tipo MIME do arquivo. |
| size          | number | Sim         | Tamanho em bytes. |
| uploadedAt    | string | Sim         | Data/hora do upload em ISO 8601 UTC. |
| owner         | string | Sim         | Identificador do usuário dono do documento. |
| storagePath   | string | Sim         | Caminho absoluto/relativo do arquivo em `backend/storage`. |

### Estrutura em memória

- Repositório em memória com uma coleção de `DocumentMetadata`.
- Índice primário por `id` para acesso eficiente no download.
- Opcional: índice secundário por `owner` para futuras evoluções.

## 6. Contratos de API

### 6.1 Health Check

**GET `/health`**

- Objetivo: verificar disponibilidade da API.
- Resposta de sucesso `200`:

```json
{
  "status": "ok"
}
```

### 6.2 Upload de documento

**POST `/upload`**

- `Content-Type`: `multipart/form-data`
- Campos esperados:
- `file` (binário): arquivo a ser enviado.
- `owner` (string): identificador do usuário.

#### Regras de validação

- `file` é obrigatório.
- `owner` é obrigatório e não vazio.
- Em caso de falha de validação, retornar `400`.

#### Resposta de sucesso `201`

```json
{
  "id": "doc_01J9ZK9E2ABCD1234",
  "originalName": "contrato.pdf",
  "storageName": "1722869400000-contrato.pdf",
  "mimeType": "application/pdf",
  "size": 249381,
  "uploadedAt": "2026-08-05T14:10:00.000Z",
  "owner": "user-123"
}
```

#### Respostas de erro

- `400 Bad Request`: campos obrigatórios ausentes/inválidos.
- `500 Internal Server Error`: falha ao salvar arquivo ou metadados.

### 6.3 Listagem de documentos

**GET `/documents`**

- Query params opcionais:
- `owner` (string): filtra documentos por dono.

#### Resposta de sucesso `200`

```json
[
  {
    "id": "doc_01J9ZK9E2ABCD1234",
    "originalName": "contrato.pdf",
    "storageName": "1722869400000-contrato.pdf",
    "mimeType": "application/pdf",
    "size": 249381,
    "uploadedAt": "2026-08-05T14:10:00.000Z",
    "owner": "user-123"
  }
]
```

### 6.4 Download de documento

**GET `/documents/:id/download`**

- Path params:
- `id` (string): identificador do documento.

#### Resposta de sucesso `200`

- Corpo binário do arquivo.
- Headers esperados:
- `Content-Type`: conforme MIME salvo.
- `Content-Disposition`: `attachment; filename="<originalName>"`.

#### Respostas de erro

- `404 Not Found`: documento não encontrado nos metadados ou arquivo inexistente em disco.
- `500 Internal Server Error`: erro de leitura do arquivo.

## 7. Decisões arquiteturais

### 7.1 Clean Architecture simples

Separação obrigatória no backend (`backend/src`):

- `routes/`: mapeamento HTTP e ligação para controllers.
- `controllers/`: parsing de request, validação básica, serialização de response, mapeamento de status HTTP.
- `services/`: regras de negócio (upload, listagem, download, coerência de metadados).
- `repositories/`: persistência local (filesystem para arquivos e memória para metadados).

Fluxo de dependência:

- `routes -> controllers -> services -> repositories`

Restrições:

- `services` não dependem de Express.
- `repositories` não conhecem detalhes HTTP.
- `controllers` não contêm regra de negócio complexa.

### 7.2 Estratégia de armazenamento

- Upload com `multer` em `diskStorage`.
- Diretório padrão: `backend/storage`.
- Nome de arquivo persistido deve evitar colisões (timestamp + sufixo aleatório ou UUID).
- Metadados ficam em memória para simplicidade do seed.

### 7.3 Configuração (12-Factor)

Variáveis mínimas sugeridas:

- `PORT`: porta HTTP (default `3000`).
- `STORAGE_DIR`: caminho de persistência local (default `backend/storage`).
- `MAX_FILE_SIZE_MB`: limite de upload para proteção básica.

## 8. Plano de execução em etapas

### Etapa 1 - Fundações e estrutura

- Criar estrutura de pastas das camadas no backend.
- Definir interfaces/contratos internos entre controller-service-repository.
- Configurar variáveis de ambiente e defaults.

### Etapa 2 - Repositórios

- Implementar `DocumentRepository` em memória para metadados.
- Implementar `FileRepository` para operações de filesystem.
- Garantir APIs de repositório simples e testáveis.

### Etapa 3 - Serviço de domínio

- Implementar `DocumentService` com casos de uso:
- `uploadDocument`.
- `listDocuments`.
- `downloadDocumentById`.
- Aplicar validações de negócio e tratamento de erros de domínio.

### Etapa 4 - Controllers e rotas

- Implementar controllers HTTP para upload/listagem/download.
- Registrar rotas:
- `POST /upload`.
- `GET /documents`.
- `GET /documents/:id/download`.
- Integrar middleware `multer` no endpoint de upload.

### Etapa 5 - Frontend inicial

- Criar página com formulário de upload (`file` + `owner`).
- Criar listagem de documentos.
- Adicionar ação de download por item.
- Consumir backend via prefixo `/api`.

### Etapa 6 - Testes backend

- Expandir testes com `node:test` para:
- sucesso e erro no upload.
- listagem de documentos.
- download por `id` válido/inválido.
- Garantir que `npm test` cubra fluxo principal.

### Etapa 7 - Robustez e acabamento

- Padronizar respostas de erro e mensagens.
- Revisar logs e observabilidade básica.
- Revisar aderência a SOLID/DRY/KISS/YAGNI.
- Atualizar documentação técnica de uso.

## 9. Critérios de aceite

- Upload persiste arquivo em `backend/storage` via `multer`.
- Metadados do upload aparecem em `GET /documents`.
- Download retorna o arquivo correto por `id`.
- Erros `400`, `404` e `500` mapeados conforme contrato.
- Estrutura de código respeita `routes -> controllers -> services -> repositories`.
- Testes automatizados backend passando no fluxo principal.

## 10. Riscos e mitigação

- Perda de metadados ao reiniciar processo (memória): documentar limitação e planejar persistência futura.
- Crescimento de arquivos em disco local: definir política operacional de limpeza/monitoramento.
- Concorrência e colisão de nomes: usar estratégia robusta de `storageName` único.
- Segurança de upload: limitar tamanho e validar tipo MIME conforme evolução.
