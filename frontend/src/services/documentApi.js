const API_PREFIX = '/api';

function buildApiUrl(path) {
  return `${API_PREFIX}${path}`;
}

async function parseError(response) {
  try {
    const data = await response.json();
    return data?.error || 'Erro ao processar requisicao.';
  } catch {
    return 'Erro ao processar requisicao.';
  }
}

async function fetchJson(path, options = {}) {
  const response = await fetch(buildApiUrl(path), options);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function uploadDocument({ file, owner }) {
  const formData = new FormData();
  formData.append('file', file);

  if (owner) {
    formData.append('owner', owner);
  }

  return fetchJson('/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function listDocuments() {
  return fetchJson('/documents');
}

export async function downloadDocument({ id, fileName }) {
  const response = await fetch(buildApiUrl(`/documents/${id}/download`));

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = fileName || 'documento';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
