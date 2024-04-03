const AdaptateurPersistanceMemoire = require('../../src/adaptateurs/adaptateurPersistanceMemoire');

class ConstructeurAdaptateurPersistanceMemoire {
  constructor() {
    this.autorisations = [];
    this.services = [];
    this.utilisateurs = [];
    this.notificationsExpirationHomologation = [];
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

  ajouteUneNotificationExpirationHomologation(notification) {
    this.notificationsExpirationHomologation.push(notification);
    return this;
  }

  construis() {
    return AdaptateurPersistanceMemoire.nouvelAdaptateur({
      autorisations: this.autorisations,
      homologations: this.services,
      services: this.services,
      utilisateurs: this.utilisateurs,
      notificationsExpirationHomologation:
        this.notificationsExpirationHomologation,
    });
  }
}

const unePersistanceMemoire = () =>
  new ConstructeurAdaptateurPersistanceMemoire();

module.exports = { unePersistanceMemoire };
