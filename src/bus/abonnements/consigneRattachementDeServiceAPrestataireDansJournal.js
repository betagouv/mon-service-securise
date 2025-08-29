import EvenementServiceRattacheAPrestataire from '../../modeles/journalMSS/evenementServiceRattacheAPrestataire.js';

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

export { consigneRattachementDeServiceAPrestataireDansJournal };
