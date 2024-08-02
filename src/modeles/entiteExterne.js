const InformationsService = require('./informationsService');

class EntiteExterne extends InformationsService {
  constructor(donneesEntite) {
    super({
      proprietesAtomiquesRequises: ['nom', 'contact'],
      proprietesAtomiquesFacultatives: ['acces'],
    });
    this.renseigneProprietes(donneesEntite);
  }
}

module.exports = EntiteExterne;
