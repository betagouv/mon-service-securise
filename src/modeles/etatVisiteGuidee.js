const Base = require('./base');
const Referentiel = require('../referentiel');

class EtatVisiteGuidee extends Base {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: ['dejaTerminee', 'etapeCourante'],
    });
    this.renseigneProprietes(donnees);
    this.referentiel = referentiel;
  }

  termineEtape(idEtape) {
    const etapeSuivante = this.referentiel.etapeSuivanteVisiteGuidee(idEtape);
    if (etapeSuivante) {
      this.etapeCourante = etapeSuivante;
    } else {
      this.finalise();
    }
  }

  finalise() {
    this.dejaTerminee = true;
    this.etapeCourante = undefined;
  }
}

module.exports = EtatVisiteGuidee;
