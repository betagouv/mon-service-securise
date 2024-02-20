const EvenementMesuresServiceModifiees = require('./evenementMesuresServiceModifiees');
const {
  EvenementAutorisationsServiceModifiees,
} = require('./evenementAutorisationsServiceModifiees');
const {
  consigneCompletudeDansJournal,
} = require('./abonnements/consigneCompletudeDansJournal');
const {
  envoieTrackingCompletude,
} = require('./abonnements/envoieTrackingDeCompletude');
const EvenementNouveauServiceCree = require('./evenementNouveauServiceCree');
const {
  consigneNouveauServiceDansJournal,
} = require('./abonnements/consigneNouveauServiceDansJournal');
const {
  envoieTrackingDeNouveauService,
} = require('./abonnements/envoieTrackingDeNouveauService');
const {
  consigneProprietaireCreeUnServiceDansJournal,
} = require('./abonnements/consigneProprietaireCreeUnServiceDansJournal');
const {
  consigneAutorisationsModifieesDansJournal,
} = require('./abonnements/consigneAutorisationsModifieesDansJournal');

const cableTousLesAbonnes = (
  busEvenements,
  { adaptateurTracking, adaptateurJournal, depotDonnees }
) => {
  busEvenements.abonnePlusieurs(EvenementNouveauServiceCree, [
    consigneNouveauServiceDansJournal({ adaptateurJournal }),
    consigneProprietaireCreeUnServiceDansJournal({ adaptateurJournal }),
    envoieTrackingDeNouveauService({ adaptateurTracking, depotDonnees }),
    consigneCompletudeDansJournal({ adaptateurJournal }),
    envoieTrackingCompletude({ adaptateurTracking, depotDonnees }),
  ]);

  busEvenements.abonnePlusieurs(EvenementMesuresServiceModifiees, [
    consigneCompletudeDansJournal({ adaptateurJournal }),
    envoieTrackingCompletude({ adaptateurTracking, depotDonnees }),
  ]);

  busEvenements.abonne(
    EvenementAutorisationsServiceModifiees,
    consigneAutorisationsModifieesDansJournal({ adaptateurJournal })
  );
};

module.exports = { cableTousLesAbonnes };
