const Base = require('./base');
const Referentiel = require('../referentiel');

class EtatVisiteGuidee extends Base {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: ['dejaTerminee', 'enPause'],
      proprietesAtomiquesFacultatives: ['etapesVues'],
    });
    this.renseigneProprietes(donnees);
    this.referentiel = referentiel;
  }

  termineEtape(idEtape) {
    const etapeSuivante = this.referentiel.etapeSuivanteVisiteGuidee(idEtape);
    if (etapeSuivante) {
      this.etapesVues = [...new Set([...(this.etapesVues || []), idEtape])];
    } else {
      this.finalise();
    }
  }

  finalise() {
    this.dejaTerminee = true;
    this.etapesVues = undefined;
  }

  nombreEtapesRestantes() {
    const nombreEtapesVues = this.etapesVues?.length ?? 0;
    return this.referentiel.nbEtapesVisiteGuidee() - nombreEtapesVues;
  }

  metEnPause() {
    this.enPause = true;
  }

  reprends() {
    this.enPause = false;
  }
}

module.exports = EtatVisiteGuidee;
