const AdaptateurPersistanceMemoire = require('../../src/adaptateurs/adaptateurPersistanceMemoire');

class ConstructeurAdaptateurPersistanceMemoire {
  constructor() {
    this.autorisations = [];
    this.services = [];
    this.utilisateurs = [];
  }

  ajouteUneAutorisation(autorisation) {
    this.autorisations.push(autorisation);
    return this;
  }

  ajouteUnService(service) {
    this.services.push(service);
    return this;
  }

  ajouteUnUtilisateur(utilisateur) {
    this.utilisateurs.push(utilisateur);
    return this;
  }

  construis() {
    return AdaptateurPersistanceMemoire.nouvelAdaptateur({
      autorisations: this.autorisations,
      homologations: this.services,
      services: this.services,
      utilisateurs: this.utilisateurs,
    });
  }
}

const unNouvelAdaptateurMemoire = () =>
  new ConstructeurAdaptateurPersistanceMemoire();

module.exports = { unNouvelAdaptateurMemoire };
