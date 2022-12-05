const Risque = require('./risque');
const { ErreurRisqueInconnu } = require('../erreurs');
const Referentiel = require('../referentiel');

class RisqueGeneral extends Risque {
  constructor(donneesRisque = {}, referentiel = Referentiel.creeReferentielVide()) {
    super(donneesRisque, referentiel);

    this.proprietesAtomiquesRequises.push('id');
    RisqueGeneral.valide(donneesRisque, referentiel);
    this.renseigneProprietes(donneesRisque);
    this.referentiel = referentiel;
  }

  descriptionRisque() {
    return this.referentiel.descriptionRisque(this.id);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      description: this.descriptionRisque(),
    };
  }

  static valide(donnees, referentiel) {
    const { id } = donnees;
    const identifiantsRisquesRepertories = referentiel.identifiantsRisques();
    if (!identifiantsRisquesRepertories.includes(id)) {
      throw new ErreurRisqueInconnu(`Le risque "${id}" n'est pas répertorié`);
    }
  }
}

module.exports = RisqueGeneral;
