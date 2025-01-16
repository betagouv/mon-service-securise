const EvenementServiceSupprime = require('../../modeles/journalMSS/evenementServiceSupprime');

function consigneServiceSupprimeDansJournal({ adaptateurJournal }) {
  return async ({ idService }) => {
    if (!idService)
      throw new Error(
        "Impossible de consigner la suppression d'un service sans avoir l'ID du service en paramètre."
      );

    const serviceSupprime = new EvenementServiceSupprime({ idService });

    await adaptateurJournal.consigneEvenement(serviceSupprime.toJSON());
  };
}

module.exports = {
  consigneServiceSupprimeDansJournal,
};
