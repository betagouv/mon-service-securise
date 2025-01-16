const EvenementNouveauServiceCree = require('../../modeles/journalMSS/evenementNouveauServiceCree');

const leveException = (raison) => {
  throw new Error(
    `Impossible de consigner un nouveau service dans le journal MSS sans avoir le ${raison} en paramètre.`
  );
};

function consigneNouveauServiceDansJournal({ adaptateurJournal }) {
  return async (evenement) => {
    const { service, utilisateur } = evenement;

    if (!service) leveException('service');
    if (!utilisateur) leveException('créateur');

    const creation = new EvenementNouveauServiceCree({
      idService: service.id,
      idUtilisateur: utilisateur.id,
    });

    await adaptateurJournal.consigneEvenement(creation.toJSON());
  };
}

module.exports = { consigneNouveauServiceDansJournal };
