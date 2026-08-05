export default function DownloadButton({ documentId, fileName, onDownload, disabled }) {
  async function handleClick() {
    await onDownload({ id: documentId, fileName });
  }

  return (
    <button type="button" onClick={handleClick} disabled={disabled}>
      Download
    </button>
  );
}
