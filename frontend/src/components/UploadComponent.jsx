import { useState } from 'react';

export default function UploadComponent({ onUpload, isUploading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [owner, setOwner] = useState('');

  const isSubmitDisabled = !selectedFile || isUploading;

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile || isUploading) {
      return;
    }

    await onUpload({ file: selectedFile, owner: owner.trim() });

    setSelectedFile(null);
    setOwner('');
    event.target.reset();
  }

  return (
    <section>
      <h2>Enviar documento</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="owner-input">Usuario (opcional)</label>
        <input
          id="owner-input"
          type="text"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          placeholder="Ex.: joao.silva"
        />

        <label htmlFor="file-input">Arquivo</label>
        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        <button type="submit" disabled={isSubmitDisabled}>
          {isUploading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </section>
  );
}
