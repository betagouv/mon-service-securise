const Base = require('./base');

class AutorisationCreateur extends Base {
  constructor(donnees = {}) {
    super({ proprietesAtomiquesRequises: ['id', 'idUtilisateur', 'idHomologation'] });
    this.renseigneProprietes(donnees);
  }
}

module.exports = AutorisationCreateur;
