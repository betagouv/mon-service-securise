const EvenementRisquesServiceModifies = require('../../modeles/journalMSS/evenementRisquesServiceModifies');

function consigneRisquesDansJournal({ adaptateurJournal }) {
  return async (evenement) => {
    const { service } = evenement;
    if (!service)
      throw new Error(
        `Impossible de consigner les risques dans le journal MSS sans avoir le service en paramètre.`
      );

    const risques = new EvenementRisquesServiceModifies({ service });
    await adaptateurJournal.consigneEvenement(risques.toJSON());
  };
}

module.exports = { consigneRisquesDansJournal };
