const crypto = require('node:crypto');
const path = require('node:path');
const documentRepository = require('../repositories/documentRepository');
const AppError = require('../errors/AppError');

class DocumentService {
  constructor() {
    this.storageDirectory = process.env.STORAGE_DIR
      ? path.resolve(process.env.STORAGE_DIR)
      : path.resolve(__dirname, '../../storage');
  }

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

  listDocuments(owner) {
    const documents = documentRepository.findAll();

    if (!owner) {
      return documents;
    }

    return documents.filter((document) => document.owner === owner);
  }

  getDocumentById(id) {
    return documentRepository.findById(id);
  }

  validateDownloadAccess(document, owner) {
    if (owner && document.owner !== owner) {
      throw new AppError('Acesso negado ao documento.', 403);
    }
  }

  validateStoragePath(storagePath) {
    const resolvedPath = path.resolve(storagePath);
    const relativePath = path.relative(this.storageDirectory, resolvedPath);

    const isInsideStorage =
      relativePath &&
      !relativePath.startsWith('..') &&
      !path.isAbsolute(relativePath);

    if (!isInsideStorage) {
      throw new AppError('Caminho de arquivo invalido.', 400);
    }

    return resolvedPath;
  }
}

module.exports = new DocumentService();
