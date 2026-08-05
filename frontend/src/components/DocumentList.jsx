import DownloadButton from './DownloadButton';

function formatBytes(size) {
  if (!Number.isFinite(size) || size <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function formatDate(isoDate) {
  if (!isoDate) {
    return '-';
  }

  return new Date(isoDate).toLocaleString('pt-BR');
}

export default function DocumentList({ documents, isLoading, owner, onDownload, isDownloading }) {
  return (
    <section>
      <h2>Documentos</h2>

      {isLoading ? <p>Carregando documentos...</p> : null}

      {!isLoading && documents.length === 0 ? <p>Nenhum documento enviado ate o momento.</p> : null}

      {!isLoading && documents.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Dono</th>
              <th>Tamanho</th>
              <th>Enviado em</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id}>
                <td>{document.originalName}</td>
                <td>{document.owner || '-'}</td>
                <td>{formatBytes(document.size)}</td>
                <td>{formatDate(document.uploadedAt)}</td>
                <td>
                  <DownloadButton
                    documentId={document.id}
                    fileName={document.originalName}
                    owner={owner}
                    onDownload={onDownload}
                    disabled={isDownloading}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
