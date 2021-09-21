const InformationsHomologation = require('./informationsHomologation');

class EntiteExterne extends InformationsHomologation {
  constructor(donneesEntite) {
    super(['nom', 'role']);
    this.renseigneProprietes(donneesEntite);
  }
}

module.exports = EntiteExterne;
