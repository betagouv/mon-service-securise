const InformationsHomologation = require('./informationsHomologation');

class FonctionnaliteSupplementaire extends InformationsHomologation {
  constructor(donneesFonctionnaliteSupplementaire) {
    super(['description']);
    this.renseigneProprietes(donneesFonctionnaliteSupplementaire);
  }

  static proprietes() {
    return ['description'];
  }
}

module.exports = FonctionnaliteSupplementaire;
