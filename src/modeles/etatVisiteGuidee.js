const Base = require('./base');

class EtatVisiteGuidee extends Base {
  constructor(donnees = {}) {
    super({
      proprietesAtomiquesRequises: ['dejaTerminee', 'etapeCourante'],
    });
    this.renseigneProprietes(donnees);
  }
}

module.exports = EtatVisiteGuidee;
