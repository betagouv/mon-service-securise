const {
  unePersistanceMemoire,
} = require('./constructeurAdaptateurPersistanceMemoire');
const adaptateurTrackingMemoire = require('../../src/adaptateurs/adaptateurTrackingMemoire');
const DepotDonneesHomologations = require('../../src/depots/depotDonneesHomologations');
const AdaptateurJournalMSSMemoire = require('../../src/adaptateurs/adaptateurJournalMSSMemoire');
const Referentiel = require('../../src/referentiel');
const ServiceTracking = require('../../src/tracking/serviceTracking');

class ConstructeurDepotDonneesServices {
  constructor() {
    this.constructeurAdaptateurPersistance = unePersistanceMemoire();
    this.adaptateurTracking = adaptateurTrackingMemoire;
    this.adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
    this.adaptateurUUID = { genereUUID: () => 'unUUID' };
    this.referentiel = Referentiel.creeReferentielVide();
    this.serviceTracking = ServiceTracking.creeService();
  }

  avecAdaptateurChiffrement(adaptateurChiffrement) {
    this.adaptateurChiffrement = adaptateurChiffrement;
    return this;
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

  construis() {
    return DepotDonneesHomologations.creeDepot({
      adaptateurChiffrement: this.adaptateurChiffrement,
      adaptateurJournalMSS: this.adaptateurJournalMSS,
      adaptateurPersistance: this.constructeurAdaptateurPersistance.construis(),
      adaptateurTracking: this.adaptateurTracking,
      adaptateurUUID: this.adaptateurUUID,
      referentiel: this.referentiel,
      serviceTracking: this.serviceTracking,
    });
  }
}

const unDepotDeDonneesServices = () => new ConstructeurDepotDonneesServices();

module.exports = { unDepotDeDonneesServices };
