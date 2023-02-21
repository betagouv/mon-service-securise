const Etape = require('./etape');
const Referentiel = require('../../referentiel');
const { ErreurDocumentHomologationInconnu } = require('../../erreurs');

class DatesTelechargements extends Etape {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({}, referentiel);
    Object.keys(donnees).forEach((document) => {
      if (!referentiel.estDocumentHomologation(document)) {
        throw new ErreurDocumentHomologationInconnu(`Document ${document} n'est pas un document d'homologation`);
      }

      this[document] = new Date(donnees[document]);
    });
  }

  estComplete() {
    return this.referentiel
      .tousDocumentsHomologation()
      .every(({ id }) => this[id] !== undefined);
  }

  enregistreDateTelechargement(idDocument, date) {
    this[idDocument] = date;
  }

  toJSON() {
    return this.referentiel
      .tousDocumentsHomologation()
      .filter(({ id }) => this[id]?.toJSON())
      .reduce((acc, { id }) => ({ ...acc, [id]: this[id].toJSON() }), {});
  }
}

module.exports = DatesTelechargements;
