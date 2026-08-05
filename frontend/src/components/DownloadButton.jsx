export default function DownloadButton({ documentId, fileName, owner, onDownload, disabled }) {
  async function handleClick() {
    await onDownload({ id: documentId, fileName, owner });
  }

  return (
    <button type="button" onClick={handleClick} disabled={disabled}>
      Download
    </button>
  );
}
