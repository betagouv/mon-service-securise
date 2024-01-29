const EvenementNouveauServiceCree = require('../../modeles/journalMSS/evenementNouveauServiceCree');

function consigneNouveauServiceDansJournal({ adaptateurJournal }) {
  return async (evenement) => {
    const { service, utilisateur } = evenement;

    const creation = new EvenementNouveauServiceCree({
      idService: service.id,
      idUtilisateur: utilisateur.id,
    });

    await adaptateurJournal.consigneEvenement(creation.toJSON());
  };
}

module.exports = { consigneNouveauServiceDansJournal };
