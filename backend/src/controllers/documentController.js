const documentService = require('../services/documentService');

class DocumentController {
  uploadDocument(req, res) {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const owner = req.body.owner || req.header('x-user-id') || 'anonymous';
    const document = documentService.registerUploadedDocument(req.file, owner);

    return res.status(201).json(document);
  }

  listDocuments(req, res) {
    const documents = documentService.listDocuments();
    return res.json(documents);
  }

  downloadDocument(req, res) {
    const { id } = req.params;
    const document = documentService.getDocumentById(id);

    if (!document) {
      return res.status(404).json({ error: 'Documento nao encontrado.' });
    }

    return res.download(document.storagePath, document.originalName);
  }
}

module.exports = new DocumentController();