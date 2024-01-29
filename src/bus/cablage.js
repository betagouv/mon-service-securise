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

const cableTousLesAbonnes = (
  busEvenements,
  { adaptateurTracking, adaptateurJournal, depotDonnees }
) => {
  busEvenements.abonne(
    EvenementNouveauServiceCree,
    consigneNouveauServiceDansJournal({ adaptateurJournal })
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
