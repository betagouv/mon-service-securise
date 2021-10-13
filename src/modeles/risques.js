const ListeItems = require('./listeItems');
const RisqueGeneral = require('./risqueGeneral');

class Risques extends ListeItems {
  constructor(donnees, referentiel) {
    const { risques, risquesVerifies } = donnees;
    super(RisqueGeneral, { items: risques }, referentiel);
    this.risquesVerifies = risquesVerifies;
  }

  statutSaisie() {
    return this.verifies() ? Risques.COMPLETES : Risques.A_SAISIR;
  }

  verifies() {
    return this.risquesVerifies;
  }
}

module.exports = Risques;
