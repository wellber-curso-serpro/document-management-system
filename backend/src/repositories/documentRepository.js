class DocumentRepository {
  constructor() {
    this.documents = [];
  }

  create(metadata) {
    this.documents.push(metadata);
    return metadata;
  }

  findAll() {
    return [...this.documents];
  }

  findById(id) {
    return this.documents.find((document) => document.id === id) || null;
  }
}

module.exports = new DocumentRepository();