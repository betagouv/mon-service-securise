const ListeItems = require('./listeItems');
const Risque = require('./risque');

class Risques extends ListeItems {
  constructor(donnees, referentiel) {
    const { risques, risquesVerifies } = donnees;
    super(Risque, { items: risques }, referentiel);
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
