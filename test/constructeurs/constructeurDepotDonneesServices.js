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
    this.constructeurAdaptateurPersistance = unePersistanceMemoire();
    this.adaptateurUUID = { genereUUID: () => 'unUUID' };
    this.busEvenements = { publie: () => {}, abonne: () => {} };
    this.referentiel = Referentiel.creeReferentielVide();
    this.adaptateurRechercheEntite = fauxAdaptateurRechercheEntreprise();
  }

  avecAdaptateurPersistance(constructeurAdaptateurPersistance) {
    this.constructeurAdaptateurPersistance = constructeurAdaptateurPersistance;
    return this;
  }

  avecAdaptateurUUID(adaptateur) {
    this.adaptateurUUID = adaptateur;
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

  construis() {
    const adaptateurPersistance =
      this.constructeurAdaptateurPersistance.construis();

    return DepotDonneesServices.creeDepot({
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
      adaptateurPersistance,
      adaptateurUUID: this.adaptateurUUID,
      adaptateurRechercheEntite: this.adaptateurRechercheEntite,
      busEvenements: this.busEvenements,
      depotDonneesUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance,
      }),
      referentiel: this.referentiel,
    });
  }
}

const unDepotDeDonneesServices = () => new ConstructeurDepotDonneesServices();

module.exports = { unDepotDeDonneesServices };
