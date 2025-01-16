const {
  EvenementCollaboratifServiceModifie,
} = require('../../modeles/journalMSS/evenementCollaboratifServiceModifie');

const leveException = (raison) => {
  throw new Error(
    `Impossible de consigner des autorisations modifées dans le journal MSS sans avoir ${raison} en paramètre.`
  );
};

function consigneAutorisationsModifieesDansJournal({ adaptateurJournal }) {
  return async ({ idService, autorisations }) => {
    if (!idService) leveException("l'ID du service");
    if (!autorisations) leveException('les autorisations');

    const collaboratifServiceModifie = new EvenementCollaboratifServiceModifie({
      idService,
      autorisations,
    });

    await adaptateurJournal.consigneEvenement(
      collaboratifServiceModifie.toJSON()
    );
  };
}

module.exports = { consigneAutorisationsModifieesDansJournal };
