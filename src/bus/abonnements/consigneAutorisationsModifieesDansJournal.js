const {
  EvenementCollaboratifServiceModifie,
} = require('../../modeles/journalMSS/evenementCollaboratifServiceModifie');

function consigneAutorisationsModifieesDansJournal({ adaptateurJournal }) {
  return async ({ idService, autorisations }) => {
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
