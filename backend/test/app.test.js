const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { randomUUID } = require('node:crypto');
const { before, after, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');

const storageDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-storage-test-'));

process.env.STORAGE_DIR = storageDirectory;
process.env.MAX_UPLOAD_SIZE_BYTES = '1024';

const app = require('../src/app');
const documentRepository = require('../src/repositories/documentRepository');

let server;
let baseUrl;

function clearStorageDirectory() {
  for (const entry of fs.readdirSync(storageDirectory)) {
    fs.rmSync(path.join(storageDirectory, entry), { recursive: true, force: true });
  }
}

async function uploadFile({ content, fileName, mimeType, owner }) {
  const formData = new FormData();
  const blob = new Blob([content], { type: mimeType });

  formData.append('file', blob, fileName);

  if (owner) {
    formData.append('owner', owner);
  }

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });

  return response;
}

before(() => {
  server = app.listen(0);
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(() => {
  server.close();
  fs.rmSync(storageDirectory, { recursive: true, force: true });
});

beforeEach(() => {
  documentRepository.clear();
  clearStorageDirectory();
});

test('healthcheck responde com status ok', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.strictEqual(response.status, 200);

  const payload = await response.json();
  assert.deepStrictEqual(payload, { status: 'ok' });
});

test('upload sem arquivo retorna 400', async () => {
  const formData = new FormData();
  formData.append('owner', 'qa-user');

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });

  assert.strictEqual(response.status, 400);
});

test('upload com tipo de arquivo nao suportado retorna 400', async () => {
  const response = await uploadFile({
    content: 'arquivo executavel',
    fileName: 'malicioso.exe',
    mimeType: 'application/octet-stream',
    owner: 'qa-user',
  });

  assert.strictEqual(response.status, 400);
});

test('upload com arquivo acima do limite retorna 400', async () => {
  const response = await uploadFile({
    content: 'x'.repeat(2048),
    fileName: 'grande.txt',
    mimeType: 'text/plain',
    owner: 'qa-user',
  });

  assert.strictEqual(response.status, 400);
});

test('fluxo de upload, listagem e download funciona para o mesmo owner', async () => {
  const uploadResponse = await uploadFile({
    content: 'conteudo do documento',
    fileName: 'documento.txt',
    mimeType: 'text/plain',
    owner: 'alice',
  });

  assert.strictEqual(uploadResponse.status, 201);
  const uploadedDocument = await uploadResponse.json();
  assert.ok(uploadedDocument.id);

  const listResponse = await fetch(`${baseUrl}/documents?owner=alice`);
  assert.strictEqual(listResponse.status, 200);

  const documents = await listResponse.json();
  assert.strictEqual(documents.length, 1);
  assert.strictEqual(documents[0].owner, 'alice');

  const downloadResponse = await fetch(`${baseUrl}/documents/${uploadedDocument.id}/download?owner=alice`);
  assert.strictEqual(downloadResponse.status, 200);
  assert.match(downloadResponse.headers.get('content-disposition') || '', /filename="documento.txt"/);

  const downloadedContent = await downloadResponse.text();
  assert.strictEqual(downloadedContent, 'conteudo do documento');
});

test('download com owner diferente retorna 403', async () => {
  const uploadResponse = await uploadFile({
    content: 'conteudo restrito',
    fileName: 'restrito.txt',
    mimeType: 'text/plain',
    owner: 'alice',
  });

  const uploadedDocument = await uploadResponse.json();
  const response = await fetch(`${baseUrl}/documents/${uploadedDocument.id}/download?owner=bob`);

  assert.strictEqual(response.status, 403);
});

test('download de documento inexistente retorna 404', async () => {
  const response = await fetch(`${baseUrl}/documents/${randomUUID()}/download?owner=alice`);
  assert.strictEqual(response.status, 404);
});

test('path traversal e bloqueado no download', async () => {
  const maliciousDocument = {
    id: randomUUID(),
    originalName: 'forjado.txt',
    mimeType: 'text/plain',
    size: 10,
    uploadedAt: new Date().toISOString(),
    owner: 'alice',
    storageName: 'forjado.txt',
    storagePath: '/etc/passwd',
  };

  documentRepository.create(maliciousDocument);

  const response = await fetch(`${baseUrl}/documents/${maliciousDocument.id}/download?owner=alice`);
  assert.strictEqual(response.status, 400);
});

test('rota nao encontrada retorna 404', async () => {
  const response = await fetch(`${baseUrl}/rota-inexistente`);
  assert.strictEqual(response.status, 404);
});
