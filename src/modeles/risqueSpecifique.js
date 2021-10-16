const Base = require('./base');

class RisqueSpecifique extends Base {
  constructor(donneesRisque = {}) {
    super(['description', 'commentaire']);
    this.renseigneProprietes(donneesRisque);
  }
}

module.exports = RisqueSpecifique;
