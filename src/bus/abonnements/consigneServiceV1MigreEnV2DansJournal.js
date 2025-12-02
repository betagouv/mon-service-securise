import EvenementServiceMigreEnV2 from '../../modeles/journalMSS/evenementServiceMigreEnV2.js';

const leveException = (raison) => {
  throw new Error(
    `Impossible de consigner la migration en v2 du service dans le journal MSS sans avoir le ${raison} en paramètre.`
  );
};

function consigneServiceV1MigreEnV2({ adaptateurJournal }) {
  return async (evenement) => {
    const { service, utilisateur } = evenement;

    if (!service) leveException('service');
    if (!utilisateur) leveException('créateur');

    const creation = new EvenementServiceMigreEnV2({
      idService: service.id,
      idUtilisateur: utilisateur.id,
    });

    await adaptateurJournal.consigneEvenement(creation.toJSON());
  };
}

export { consigneServiceV1MigreEnV2 };
