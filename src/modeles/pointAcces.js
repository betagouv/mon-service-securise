const InformationsHomologation = require('./informationsHomologation');

class PointAcces extends InformationsHomologation {
  constructor(donneesPointsAcces) {
    super(['description']);
    this.renseigneProprietes(donneesPointsAcces);
  }
}

module.exports = PointAcces;
