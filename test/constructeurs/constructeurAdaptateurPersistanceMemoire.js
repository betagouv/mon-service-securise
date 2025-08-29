import * as AdaptateurPersistanceMemoire from '../../src/adaptateurs/adaptateurPersistanceMemoire.js';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import { uneAutorisation } from './constructeurAutorisation.js';

class ConstructeurAdaptateurPersistanceMemoire {
  constructor(adaptateurChiffrement) {
    this.autorisations = [];
    this.services = [];
    this.utilisateurs = [];
    this.notificationsExpirationHomologation = [];
    this.suggestionsActions = [];
    this.activitesMesure = [];
    this.modelesMesureSpecifique = [];
    this.associationModelesMesureSpecifiqueServices = [];
    this.adaptateurChiffrement = adaptateurChiffrement;
  }

  ajouteUneAutorisation(autorisation) {
    this.autorisations.push(autorisation);
    return this;
  }

  nommeCommeProprietaire(idUtilisateur, idsServices) {
    idsServices
      .map((unService) =>
        uneAutorisation().deProprietaire(idUtilisateur, unService)
      )
      .map((autorisation) => this.ajouteUneAutorisation(autorisation.donnees));

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
      siretHash: this.adaptateurChiffrement.hacheSha256(
        service.descriptionService?.organisationResponsable?.siret
      ),
    });
    return this;
  }

  ajouteUnUtilisateur(utilisateur) {
    const { id, emailHash, idResetMotDePasse, dateCreation, ...donnees } =
      utilisateur;
    this.utilisateurs.push({
      id,
      donnees,
      emailHash,
      idResetMotDePasse,
      dateCreation,
    });
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

  avecUnModeleDeMesureSpecifique(donneesModele) {
    this.modelesMesureSpecifique.push(donneesModele);
    return this;
  }

  associeLeServiceAuxModelesDeMesureSpecifique(idService, idsModeles) {
    idsModeles.map((unModele) =>
      this.associationModelesMesureSpecifiqueServices.push({
        idService,
        idModele: unModele,
      })
    );
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
      modelesMesureSpecifique: this.modelesMesureSpecifique,
      associationModelesMesureSpecifiqueServices:
        this.associationModelesMesureSpecifiqueServices,
    });
  }
}

const unePersistanceMemoire = (
  adaptateurChiffrement = fauxAdaptateurChiffrement()
) => new ConstructeurAdaptateurPersistanceMemoire(adaptateurChiffrement);

export { unePersistanceMemoire };
