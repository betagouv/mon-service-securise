const Etape = require('./etape');
const Avis = require('../avis');
const InformationsHomologation = require('../informationsHomologation');
const { creeReferentielVide } = require('../../referentiel');

class EtapeAvis extends Etape {
  constructor(
    { avis = [], avecAvis = null } = {},
    referentiel = creeReferentielVide()
  ) {
    super({ proprietesAtomiquesRequises: ['avecAvis'] }, referentiel);

    this.renseigneProprietes({ avecAvis });
    this.avis = avis.map((a) => new Avis(a, this.referentiel));
  }

  enregistreAvis(avis) {
    this.avecAvis = true;
    this.avis = avis.map((a) => new Avis(a, this.referentiel));
  }

  declareSansAvis() {
    this.avecAvis = false;
    this.avis = [];
  }

  estComplete() {
    if (this.avecAvis === null) return false;
    return this.avecAvis
      ? this.avis.every(
          (a) => a.statutSaisie() === InformationsHomologation.COMPLETES
        )
      : true;
  }

  toJSON() {
    return {
      avis: this.avis.map((a) => a.toJSON()),
      avecAvis: this.avecAvis,
    };
  }
}

module.exports = EtapeAvis;
