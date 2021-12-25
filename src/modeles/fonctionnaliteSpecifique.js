const InformationsHomologation = require('./informationsHomologation');

class FonctionnaliteSpecifique extends InformationsHomologation {
  constructor(donneesFonctionnaliteSpecifique) {
    super({ proprietesAtomiques: ['description'] });
    this.renseigneProprietes(donneesFonctionnaliteSpecifique);
  }

  static proprietes() {
    return ['description'];
  }
}

module.exports = FonctionnaliteSpecifique;
