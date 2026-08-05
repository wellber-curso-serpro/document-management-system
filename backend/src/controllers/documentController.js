const documentService = require('../services/documentService');
const AppError = require('../errors/AppError');

class DocumentController {
  uploadDocument(req, res) {
    if (!req.file) {
      throw new AppError('Nenhum arquivo enviado.', 400);
    }

    const owner = req.body.owner || req.header('x-user-id') || 'anonymous';
    const document = documentService.registerUploadedDocument(req.file, owner);

    return res.status(201).json(document);
  }

  listDocuments(req, res) {
    const owner = req.query.owner || req.header('x-user-id') || '';
    const documents = documentService.listDocuments(owner);

    return res.json(documents);
  }

  downloadDocument(req, res) {
    const { id } = req.params;
    const owner = req.query.owner || req.header('x-user-id') || '';
    const document = documentService.getDocumentById(id);

    if (!document) {
      throw new AppError('Documento nao encontrado.', 404);
    }

    documentService.validateDownloadAccess(document, owner);
    const safeStoragePath = documentService.validateStoragePath(document.storagePath);

    return res.download(safeStoragePath, document.originalName);
  }
}

module.exports = new DocumentController();
