const Etape = require('./etape');

class Documents extends Etape {
  constructor({ documents = [], avecDocuments = null } = {}) {
    super({
      proprietesAtomiquesRequises: ['avecDocuments'],
      proprietesListes: ['documents'],
    });

    this.renseigneProprietes({ documents, avecDocuments });
  }

  enregistreDocuments(documents) {
    this.avecDocuments = true;
    this.documents = documents;
  }

  declareSansDocument() {
    this.avecDocuments = false;
    this.documents = [];
  }

  estComplete() {
    if (this.avecDocuments === null) return false;
    return this.avecDocuments ? this.documents.length > 0 : true;
  }
}

module.exports = Documents;
