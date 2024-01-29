const EvenementMesuresServiceModifiees = require('./evenementMesuresServiceModifiees');
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

const cableTousLesAbonnes = (
  busEvenements,
  { adaptateurTracking, adaptateurJournal, depotDonnees }
) => {
  busEvenements.abonne(
    EvenementNouveauServiceCree,
    consigneNouveauServiceDansJournal({ adaptateurJournal })
  );

  busEvenements.abonne(
    EvenementNouveauServiceCree,
    envoieTrackingDeNouveauService({ adaptateurTracking, depotDonnees })
  );

  busEvenements.abonne(
    EvenementMesuresServiceModifiees,
    consigneCompletudeDansJournal({ adaptateurJournal })
  );

  busEvenements.abonne(
    EvenementMesuresServiceModifiees,
    envoieTrackingCompletude({ adaptateurTracking, depotDonnees })
  );
};

module.exports = { cableTousLesAbonnes };
