const InformationsService = require('./informationsService');

class ItemAvecDescription extends InformationsService {
  constructor(donneesItemAvecDescription) {
    super({ proprietesAtomiquesRequises: ['description'] });
    this.renseigneProprietes(donneesItemAvecDescription);
  }

  static proprietes() {
    return ['description'];
  }
}

module.exports = ItemAvecDescription;
