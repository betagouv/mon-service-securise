const Etape = require('./etape');

class Autorite extends Etape {
  constructor({ nom, fonction } = {}) {
    super({ proprietesAtomiquesRequises: ['nom', 'fonction'] });
    this.renseigneProprietes({ nom, fonction });
  }

  enregistreAutoriteHomologation(nom, fonction) {
    this.nom = nom;
    this.fonction = fonction;
  }

  estComplete() {
    return !!(this.nom && this.fonction);
  }
}

module.exports = Autorite;
