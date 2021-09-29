const InformationsHomologation = require('./informationsHomologation');

class EntiteExterne extends InformationsHomologation {
  constructor(donneesEntite) {
    super(['nom', 'acces']);
    this.renseigneProprietes(donneesEntite);
  }
}

module.exports = EntiteExterne;
