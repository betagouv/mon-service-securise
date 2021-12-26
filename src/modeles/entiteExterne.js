const InformationsHomologation = require('./informationsHomologation');

class EntiteExterne extends InformationsHomologation {
  constructor(donneesEntite) {
    super({
      proprietesAtomiquesRequises: ['nom', 'contact'],
      proprietesAtomiquesFacultatives: ['acces'],
    });
    this.renseigneProprietes(donneesEntite);
  }
}

module.exports = EntiteExterne;
