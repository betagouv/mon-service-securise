const AdaptateurPersistanceMemoire = require('../../src/adaptateurs/adaptateurPersistanceMemoire');
const fauxAdaptateurChiffrement = require('../mocks/adaptateurChiffrement');

class ConstructeurAdaptateurPersistanceMemoire {
  constructor(adaptateurChiffrement) {
    this.autorisations = [];
    this.services = [];
    this.utilisateurs = [];
    this.notificationsExpirationHomologation = [];
    this.suggestionsActions = [];
    this.activitesMesure = [];
    this.adaptateurChiffrement = adaptateurChiffrement;
  }

  ajouteUneAutorisation(autorisation) {
    this.autorisations.push(autorisation);
    return this;
  }

  ajouteUnService(service) {
    const { id, ...donnees } = service;
    this.services.push({
      id,
      donnees,
      nomServiceHash: this.adaptateurChiffrement.hacheSha256(
        service.descriptionService.nomService
      ),
    });
    return this;
  }

  ajouteUnUtilisateur(utilisateur) {
    const { id, emailHash, idResetMotDePasse, ...donnees } = utilisateur;
    this.utilisateurs.push({ id, donnees, emailHash, idResetMotDePasse });
    return this;
  }

  ajouteUneNotificationExpirationHomologation(notification) {
    this.notificationsExpirationHomologation.push(notification);
    return this;
  }

  avecUneSuggestionAction(suggestion) {
    this.suggestionsActions.push(suggestion);
    return this;
  }

  avecUneActiviteMesure(donneesActivite) {
    this.activitesMesure.push(donneesActivite);
    return this;
  }

  construis() {
    return AdaptateurPersistanceMemoire.nouvelAdaptateur({
      autorisations: this.autorisations,
      services: this.services,
      utilisateurs: this.utilisateurs,
      notificationsExpirationHomologation:
        this.notificationsExpirationHomologation,
      suggestionsActions: this.suggestionsActions,
      activitesMesure: this.activitesMesure,
    });
  }
}

const unePersistanceMemoire = (
  adaptateurChiffrement = fauxAdaptateurChiffrement()
) => new ConstructeurAdaptateurPersistanceMemoire(adaptateurChiffrement);

module.exports = { unePersistanceMemoire };
