const EvenementMesuresServiceModifiees = require('./evenementMesuresServiceModifiees');
const {
  consigneCompletudeDansJournal,
} = require('./abonnements/mesuresServiceModifiees/consigneCompletudeDansJournal');
const {
  envoieTrackingCompletude,
} = require('./abonnements/mesuresServiceModifiees/envoieTrackingDeCompletude');

const cableTousLesAbonnes = (
  busEvenements,
  { adaptateurTracking, adaptateurJournal, depotDonnees }
) => {
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
