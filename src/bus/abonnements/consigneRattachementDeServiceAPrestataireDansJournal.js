const EvenementServiceRattacheAPrestataire = require('../../modeles/journalMSS/evenementServiceRattacheAPrestataire');

function consigneRattachementDeServiceAPrestataireDansJournal({
  adaptateurJournal,
}) {
  return async ({ idService, codePrestataire }) => {
    const evenementJournal = new EvenementServiceRattacheAPrestataire({
      idService,
      codePrestataire,
    });

    await adaptateurJournal.consigneEvenement(evenementJournal.toJSON());
  };
}

module.exports = { consigneRattachementDeServiceAPrestataireDansJournal };
