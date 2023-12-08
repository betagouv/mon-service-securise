const EvenementMesuresServiceModifiees = require('./evenementMesuresServiceModifiees');
const {
  consigneDansJournal,
} = require('./abonnements/mesuresServiceModifiees/consigneDansJournal');

const cableTousLesAbonnes = (busEvenements, { adaptateurJournal }) => {
  busEvenements.abonne(
    EvenementMesuresServiceModifiees,
    consigneDansJournal({ adaptateurJournal })
  );
};

module.exports = { cableTousLesAbonnes };
