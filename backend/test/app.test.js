const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { before, after, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');

const storageDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-backend-test-'));
process.env.STORAGE_DIR = storageDirectory;

const app = require('../src/app');
const documentRepository = require('../src/repositories/documentRepository');

let server;
let baseUrl;

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

  for (const entry of fs.readdirSync(storageDirectory)) {
    fs.rmSync(path.join(storageDirectory, entry), { recursive: true, force: true });
  }
});

async function uploadFixtureDocument() {
  const formData = new FormData();
  const content = `conteudo de teste ${randomUUID()}`;

  formData.append('owner', 'qa-user');
  formData.append('file', new Blob([content], { type: 'text/plain' }), 'documento-teste.txt');

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });

  return { response, content };
}

test('upload cria documento e retorna metadados', async () => {
  const { response } = await uploadFixtureDocument();
  assert.strictEqual(response.status, 201);

  const payload = await response.json();
  assert.ok(payload.id);
  assert.strictEqual(payload.originalName, 'documento-teste.txt');
  assert.strictEqual(payload.owner, 'qa-user');
  assert.ok(payload.storagePath);
});

test('listagem retorna documentos enviados', async () => {
  await uploadFixtureDocument();

  const response = await fetch(`${baseUrl}/documents`);
  assert.strictEqual(response.status, 200);

  const payload = await response.json();
  assert.strictEqual(Array.isArray(payload), true);
  assert.strictEqual(payload.length, 1);
  assert.strictEqual(payload[0].originalName, 'documento-teste.txt');
});

test('download retorna conteudo do documento enviado', async () => {
  const { response: uploadResponse, content } = await uploadFixtureDocument();
  const uploadedDocument = await uploadResponse.json();

  const response = await fetch(`${baseUrl}/documents/${uploadedDocument.id}/download`);
  assert.strictEqual(response.status, 200);
  assert.match(response.headers.get('content-disposition') || '', /documento-teste\.txt/);

  const downloadedContent = await response.text();
  assert.strictEqual(downloadedContent, content);
});

test('download de id inexistente retorna 404', async () => {
  const response = await fetch(`${baseUrl}/documents/${randomUUID()}/download`);
  assert.strictEqual(response.status, 404);
});
