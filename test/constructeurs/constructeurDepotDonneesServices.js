import { unePersistanceMemoire } from './constructeurAdaptateurPersistanceMemoire.js';
import * as DepotDonneesServices from '../../src/depots/depotDonneesServices.js';
import * as Referentiel from '../../src/referentiel.js';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import fauxAdaptateurRechercheEntreprise from '../mocks/adaptateurRechercheEntreprise.js';
import * as DepotDonneesUtilisateurs from '../../src/depots/depotDonneesUtilisateurs.js';
import * as DepotDonneesSuggestionsActions from '../../src/depots/depotDonneesSuggestionsActions.js';
import { creeReferentielV2 } from '../../src/referentielV2.js';

class ConstructeurDepotDonneesServices {
  constructor() {
    this.adaptateurChiffrement = fauxAdaptateurChiffrement();
    this.constructeurAdaptateurPersistance = unePersistanceMemoire();
    this.adaptateurUUID = { genereUUID: () => 'unUUID' };
    this.busEvenements = { publie: () => {}, abonne: () => {} };
    this.referentiel = Referentiel.creeReferentielVide();
    this.referentielV2 = creeReferentielV2();
    this.adaptateurRechercheEntite = fauxAdaptateurRechercheEntreprise();
  }

  avecConstructeurDePersistance(constructeurAdaptateurPersistance) {
    this.constructeurAdaptateurPersistance = constructeurAdaptateurPersistance;
    return this;
  }

  avecAdaptateurPersistance(adaptateur) {
    this.adaptateurPersistance = adaptateur;
    return this;
  }

  avecAdaptateurUUID(adaptateur) {
    this.adaptateurUUID = adaptateur;
    return this;
  }

  avecAdaptateurChiffrement(adaptateur) {
    this.adaptateurChiffrement = adaptateur;
    return this;
  }

  avecReferentiel(referentiel) {
    this.referentiel = referentiel;
    return this;
  }

  avecReferentielV2(referentielV2) {
    this.referentielV2 = referentielV2;
    return this;
  }

  avecBusEvenements(busEvenements) {
    this.busEvenements = busEvenements;
    return this;
  }

  avecAdaptateurRechercheEntite(adaptateurRechercheEntite) {
    this.adaptateurRechercheEntite = adaptateurRechercheEntite;
    return this;
  }

  avecDepotDonneesUtilisateurs(depotUtilisateurs) {
    this.depotDonneesUtilisateurs = depotUtilisateurs;
    return this;
  }

  avecDepotDonneesSuggestionsActions(depotSuggestions) {
    this.depotDonneesSuggestionsActions = depotSuggestions;
    return this;
  }

  construis() {
    const adaptateurPersistance =
      this.adaptateurPersistance ??
      this.constructeurAdaptateurPersistance.construis();

    return DepotDonneesServices.creeDepot({
      adaptateurChiffrement: this.adaptateurChiffrement,
      adaptateurPersistance,
      adaptateurUUID: this.adaptateurUUID,
      adaptateurRechercheEntite: this.adaptateurRechercheEntite,
      busEvenements: this.busEvenements,
      depotDonneesUtilisateurs:
        this.depotDonneesUtilisateurs ??
        DepotDonneesUtilisateurs.creeDepot({
          adaptateurPersistance,
          adaptateurChiffrement: this.adaptateurChiffrement,
        }),
      depotDonneesSuggestionsActions:
        this.depotDonneesSuggestionsActions ??
        DepotDonneesSuggestionsActions.creeDepot({ adaptateurPersistance }),
      referentiel: this.referentiel,
      referentielV2: this.referentielV2,
    });
  }
}

const unDepotDeDonneesServices = () => new ConstructeurDepotDonneesServices();

export { unDepotDeDonneesServices };
