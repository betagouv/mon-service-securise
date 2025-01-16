const {
  unePersistanceMemoire,
} = require('./constructeurAdaptateurPersistanceMemoire');
const DepotDonneesServices = require('../../src/depots/depotDonneesServices');
const Referentiel = require('../../src/referentiel');
const fauxAdaptateurChiffrement = require('../mocks/adaptateurChiffrement');
const fauxAdaptateurRechercheEntreprise = require('../mocks/adaptateurRechercheEntreprise');
const DepotDonneesUtilisateurs = require('../../src/depots/depotDonneesUtilisateurs');

class ConstructeurDepotDonneesServices {
  constructor() {
    this.adaptateurChiffrement = fauxAdaptateurChiffrement();
    this.constructeurAdaptateurPersistance = unePersistanceMemoire();
    this.adaptateurUUID = { genereUUID: () => 'unUUID' };
    this.busEvenements = { publie: () => {}, abonne: () => {} };
    this.referentiel = Referentiel.creeReferentielVide();
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
      referentiel: this.referentiel,
    });
  }
}

const unDepotDeDonneesServices = () => new ConstructeurDepotDonneesServices();

module.exports = { unDepotDeDonneesServices };
