const Base = require('../base');

class AutorisationBase extends Base {
  constructor(donnees = {}) {
    super({ proprietesAtomiquesRequises: ['id', 'idUtilisateur', 'idHomologation'] });
    this.renseigneProprietes(donnees);
  }
}

module.exports = AutorisationBase;
