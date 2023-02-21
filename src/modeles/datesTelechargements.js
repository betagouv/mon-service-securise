const Etape = require('./etape');

const proprietes = ['annexes', 'decision', 'synthese'];

class DatesTelechargements extends Etape {
  constructor(donnees = {}) {
    super();
    proprietes.forEach((propriete) => {
      if (donnees[propriete]) this[propriete] = new Date(donnees[propriete]);
    });
  }

  estComplete() {
    return !!(this.annexes && this.decision && this.synthese);
  }

  enregistreDateTelechargement(nomDocument, date) {
    this[nomDocument] = date;
  }

  toJSON() {
    return proprietes
      .filter((propriete) => this[propriete]?.toJSON())
      .reduce((acc, propriete) => ({ ...acc, [propriete]: this[propriete].toJSON() }), {});
  }
}

module.exports = DatesTelechargements;
