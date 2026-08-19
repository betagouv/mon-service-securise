import Base from './base.js';

class EtatVisiteGuidee extends Base {
  constructor(donnees = {}) {
    super({
      proprietesAtomiquesRequises: ['dejaTerminee'],
    });
    this.renseigneProprietes(donnees);
  }

  finalise() {
    this.dejaTerminee = true;
  }
}

export default EtatVisiteGuidee;
