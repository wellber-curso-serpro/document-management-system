const crypto = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');

class DocumentService {
  registerUploadedDocument(file, owner) {
    const document = {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner,
      storageName: file.filename,
      storagePath: file.path,
    };

    return documentRepository.create(document);
  }

  listDocuments() {
    return documentRepository.findAll();
  }

  getDocumentById(id) {
    return documentRepository.findById(id);
  }
}

module.exports = new DocumentService();