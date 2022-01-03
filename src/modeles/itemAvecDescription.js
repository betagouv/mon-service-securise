const InformationsHomologation = require('./informationsHomologation');

class ItemAvecDescription extends InformationsHomologation {
  constructor(donneesItemAvecDescription) {
    super({ proprietesAtomiquesRequises: ['description'] });
    this.renseigneProprietes(donneesItemAvecDescription);
  }

  static proprietes() {
    return ['description'];
  }
}

module.exports = ItemAvecDescription;
