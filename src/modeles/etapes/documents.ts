import Etape from './etape.js';

export type DonneesDocuments = {
  avecDocuments?: boolean | null;
  documents?: string[];
};

class Documents extends Etape {
  avecDocuments!: boolean | null;
  documents!: string[];

  constructor({
    documents = [],
    avecDocuments = null,
  }: Partial<DonneesDocuments> = {}) {
    super({
      proprietesAtomiquesRequises: ['avecDocuments'],
      proprietesListes: ['documents'],
    });

    this.renseigneProprietes({ documents, avecDocuments });
  }

  enregistreDocuments(documents: string[]) {
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

export default Documents;
