const {
  unePersistanceMemoire,
} = require('./constructeurAdaptateurPersistanceMemoire');
const DepotDonneesHomologations = require('../../src/depots/depotDonneesHomologations');
const Referentiel = require('../../src/referentiel');
const fauxAdaptateurChiffrement = require('../mocks/adaptateurChiffrement');

class ConstructeurDepotDonneesServices {
  constructor() {
    this.constructeurAdaptateurPersistance = unePersistanceMemoire();
    this.adaptateurUUID = { genereUUID: () => 'unUUID' };
    this.busEvenements = { publie: () => {}, abonne: () => {} };
    this.referentiel = Referentiel.creeReferentielVide();
  }

  avecAdaptateurPersistance(constructeurAdaptateurPersistance) {
    this.constructeurAdaptateurPersistance = constructeurAdaptateurPersistance;
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

  construis() {
    return DepotDonneesHomologations.creeDepot({
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
      adaptateurPersistance: this.constructeurAdaptateurPersistance.construis(),
      adaptateurUUID: this.adaptateurUUID,
      busEvenements: this.busEvenements,
      referentiel: this.referentiel,
    });
  }
}

const unDepotDeDonneesServices = () => new ConstructeurDepotDonneesServices();

module.exports = { unDepotDeDonneesServices };
