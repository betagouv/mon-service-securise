const {
  unePersistanceMemoire,
} = require('./constructeurAdaptateurPersistanceMemoire');
const DepotDonneesHomologations = require('../../src/depots/depotDonneesHomologations');
const AdaptateurJournalMSSMemoire = require('../../src/adaptateurs/adaptateurJournalMSSMemoire');
const Referentiel = require('../../src/referentiel');
const {
  fabriqueAdaptateurTrackingMemoire,
} = require('../../src/adaptateurs/adaptateurTrackingMemoire');
const {
  fabriqueServiceTracking,
} = require('../../src/tracking/serviceTracking');
const fauxAdaptateurChiffrement = require('../mocks/adaptateurChiffrement');

class ConstructeurDepotDonneesServices {
  constructor() {
    this.constructeurAdaptateurPersistance = unePersistanceMemoire();
    this.adaptateurTracking = fabriqueAdaptateurTrackingMemoire();
    this.adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
    this.adaptateurUUID = { genereUUID: () => 'unUUID' };
    this.busEvenements = { publie: () => {}, abonne: () => {} };
    this.referentiel = Referentiel.creeReferentielVide();
    this.serviceTracking = fabriqueServiceTracking();
  }

  avecAdaptateurPersistance(constructeurAdaptateurPersistance) {
    this.constructeurAdaptateurPersistance = constructeurAdaptateurPersistance;
    return this;
  }

  avecJournalMSS(adaptateurJournalMSS) {
    this.adaptateurJournalMSS = adaptateurJournalMSS;
    return this;
  }

  avecAdaptateurTracking(adaptateurTracking) {
    this.adaptateurTracking = adaptateurTracking;
    return this;
  }

  avecServiceTracking(serviceTracking) {
    this.serviceTracking = serviceTracking;
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
      adaptateurJournalMSS: this.adaptateurJournalMSS,
      adaptateurPersistance: this.constructeurAdaptateurPersistance.construis(),
      adaptateurTracking: this.adaptateurTracking,
      adaptateurUUID: this.adaptateurUUID,
      busEvenements: this.busEvenements,
      referentiel: this.referentiel,
      serviceTracking: this.serviceTracking,
    });
  }
}

const unDepotDeDonneesServices = () => new ConstructeurDepotDonneesServices();

module.exports = { unDepotDeDonneesServices };
