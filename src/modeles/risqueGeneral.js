const Risque = require('./risque');
const { ErreurRisqueInconnu } = require('../erreurs');
const Referentiel = require('../referentiel');

class RisqueGeneral extends Risque {
  constructor(donneesRisque = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: ['id', 'niveauGravite'],
      proprietesAtomiquesFacultatives: ['commentaire'],
    }, referentiel);

    RisqueGeneral.valide(donneesRisque, referentiel);
    this.renseigneProprietes(donneesRisque);
  }

  descriptionRisque() {
    return this.referentiel.descriptionRisque(this.id);
  }

  static valide(donnees, referentiel) {
    super.valide(donnees, referentiel);

    const { id } = donnees;
    const identifiantsRisquesRepertories = referentiel.identifiantsRisques();
    if (!identifiantsRisquesRepertories.includes(id)) {
      throw new ErreurRisqueInconnu(`Le risque "${id}" n'est pas répertorié`);
    }
  }
}

module.exports = RisqueGeneral;
