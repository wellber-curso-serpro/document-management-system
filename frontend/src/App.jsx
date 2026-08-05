import { useCallback, useEffect, useState } from 'react';
import DocumentList from './components/DocumentList';
import UploadComponent from './components/UploadComponent';
import { downloadDocument, listDocuments, uploadDocument } from './services/documentApi';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadDocuments = useCallback(async () => {
    setErrorMessage('');

    try {
      const data = await listDocuments();
      setDocuments(data);
    } catch (error) {
      setErrorMessage(error.message || 'Erro ao carregar documentos.');
    }
  }, []);

  useEffect(() => {
    async function initialize() {
      setIsLoading(true);
      await loadDocuments();
      setIsLoading(false);
    }

    initialize();
  }, [loadDocuments]);

  async function handleUpload({ file, owner }) {
    setIsUploading(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      await uploadDocument({ file, owner });
      setStatusMessage('Documento enviado com sucesso.');
      await loadDocuments();
    } catch (error) {
      setErrorMessage(error.message || 'Erro ao enviar documento.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDownload({ id, fileName }) {
    setIsDownloading(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      await downloadDocument({ id, fileName });
      setStatusMessage('Download iniciado.');
    } catch (error) {
      setErrorMessage(error.message || 'Erro ao baixar documento.');
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>

      {statusMessage ? <p>{statusMessage}</p> : null}
      {errorMessage ? <p>{errorMessage}</p> : null}

      <UploadComponent onUpload={handleUpload} isUploading={isUploading} />

      <DocumentList
        documents={documents}
        isLoading={isLoading}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
    </main>
  );
}
