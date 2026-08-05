import { useState } from 'react';

export default function UploadComponent({ onUpload, isUploading, owner, onOwnerChange }) {
  const [selectedFile, setSelectedFile] = useState(null);

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
          onChange={(event) => onOwnerChange(event.target.value)}
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
