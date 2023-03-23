const Etape = require('./etape');
const Avis = require('../avis');
const InformationsHomologation = require('../informationsHomologation');
const { creeReferentielVide } = require('../../referentiel');

class EtapeAvis extends Etape {
  constructor({ avis = [] } = {}, referentiel = creeReferentielVide()) {
    super({}, referentiel);

    this.enregistreAvis(avis);
  }

  enregistreAvis(avis) {
    this.avis = avis.map((a) => new Avis(a, this.referentiel));
  }

  estComplete() {
    return this.avis.every((a) => a.statutSaisie() === InformationsHomologation.COMPLETES);
  }

  toJSON() {
    return { avis: this.avis.map((a) => a.toJSON()) };
  }
}

module.exports = EtapeAvis;
