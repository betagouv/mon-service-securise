const {
  unePersistanceMemoire,
} = require('./constructeurAdaptateurPersistanceMemoire');
const DepotDonneesHomologations = require('../../src/depots/depotDonneesHomologations');
const AdaptateurJournalMSSMemoire = require('../../src/adaptateurs/adaptateurJournalMSSMemoire');
const Referentiel = require('../../src/referentiel');
const fauxAdaptateurChiffrement = require('../mocks/adaptateurChiffrement');

class ConstructeurDepotDonneesServices {
  constructor() {
    this.constructeurAdaptateurPersistance = unePersistanceMemoire();
    this.adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
    this.adaptateurUUID = { genereUUID: () => 'unUUID' };
    this.busEvenements = { publie: () => {}, abonne: () => {} };
    this.referentiel = Referentiel.creeReferentielVide();
  }

  avecAdaptateurPersistance(constructeurAdaptateurPersistance) {
    this.constructeurAdaptateurPersistance = constructeurAdaptateurPersistance;
    return this;
  }

  avecJournalMSS(adaptateurJournalMSS) {
    this.adaptateurJournalMSS = adaptateurJournalMSS;
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
      adaptateurUUID: this.adaptateurUUID,
      busEvenements: this.busEvenements,
      referentiel: this.referentiel,
    });
  }
}

const unDepotDeDonneesServices = () => new ConstructeurDepotDonneesServices();

module.exports = { unDepotDeDonneesServices };
