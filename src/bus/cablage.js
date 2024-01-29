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
  // =========================
  // CRÉATION DE SERVICE
  busEvenements.abonne(
    EvenementNouveauServiceCree,
    consigneNouveauServiceDansJournal({ adaptateurJournal })
  );
  busEvenements.abonne(
    EvenementNouveauServiceCree,
    envoieTrackingDeNouveauService({ adaptateurTracking, depotDonnees })
  );
  busEvenements.abonne(
    EvenementNouveauServiceCree,
    consigneCompletudeDansJournal({ adaptateurJournal })
  );
  busEvenements.abonne(
    EvenementNouveauServiceCree,
    envoieTrackingCompletude({ adaptateurTracking, depotDonnees })
  );

  // =========================
  // MODIFICATION DES MESURES
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
