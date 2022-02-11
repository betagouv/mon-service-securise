const InformationsHomologation = require('./informationsHomologation');

class ActeurHomologation extends InformationsHomologation {
  constructor(donnees) {
    super({ proprietesAtomiquesRequises: ['role', 'nom', 'fonction'] });
    this.renseigneProprietes(donnees);
  }

  static proprietes() {
    return ['role', 'nom', 'fonction'];
  }
}

module.exports = ActeurHomologation;
