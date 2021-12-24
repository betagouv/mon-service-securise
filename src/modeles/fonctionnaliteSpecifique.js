const InformationsHomologation = require('./informationsHomologation');

class FonctionnaliteSpecifique extends InformationsHomologation {
  constructor(donneesFonctionnaliteSpecifique) {
    super(['description']);
    this.renseigneProprietes(donneesFonctionnaliteSpecifique);
  }

  static proprietes() {
    return ['description'];
  }
}

module.exports = FonctionnaliteSpecifique;
