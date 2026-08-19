import Base from './base.js';
import * as Referentiel from '../referentiel.js';

class EtatVisiteGuidee extends Base {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: ['dejaTerminee'],
    });
    this.renseigneProprietes(donnees);
    this.referentiel = referentiel;
  }

  finalise() {
    this.dejaTerminee = true;
  }
}

export default EtatVisiteGuidee;
