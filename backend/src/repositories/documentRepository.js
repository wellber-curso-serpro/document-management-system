class DocumentRepository {
  constructor() {
    this.documents = [];
  }

  create(document) {
    this.documents.push(document);
    return document;
  }

  findAll() {
    return [...this.documents];
  }

  findById(id) {
    return this.documents.find((document) => document.id === id) || null;
  }

  clear() {
    this.documents = [];
  }
}

module.exports = new DocumentRepository();
