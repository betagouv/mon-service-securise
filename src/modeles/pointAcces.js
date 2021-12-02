const InformationsHomologation = require('./informationsHomologation');

class PointAcces extends InformationsHomologation {
  constructor(donneesPointsAcces) {
    super(['description']);
    this.renseigneProprietes(donneesPointsAcces);
  }

  static proprietes() {
    return ['description'];
  }
}

module.exports = PointAcces;
