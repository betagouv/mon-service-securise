const EvenementMesuresServiceModifiees = require('./evenementMesuresServiceModifiees');
const {
  consigneDansJournal,
} = require('./abonnements/mesuresServiceModifiees/consigneDansJournal');
const {
  envoieTrackingCompletude,
} = require('./abonnements/mesuresServiceModifiees/envoieTrackingDeCompletude');

const cableTousLesAbonnes = (
  busEvenements,
  { adaptateurTracking, adaptateurJournal, depotDonnees }
) => {
  busEvenements.abonne(
    EvenementMesuresServiceModifiees,
    consigneDansJournal({ adaptateurJournal })
  );

  busEvenements.abonne(
    EvenementMesuresServiceModifiees,
    envoieTrackingCompletude({ adaptateurTracking, depotDonnees })
  );
};

module.exports = { cableTousLesAbonnes };
