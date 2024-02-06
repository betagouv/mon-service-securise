const {
  EvenementCollaboratifServiceModifie,
} = require('../../modeles/journalMSS/evenementCollaboratifServiceModifie');
const Autorisation = require('../../modeles/autorisations/autorisation');

const { PROPRIETAIRE } = Autorisation.RESUME_NIVEAU_DROIT;

function consigneProprietaireCreeUnServiceDansJournal({ adaptateurJournal }) {
  return async (evenement) => {
    const { service, utilisateur } = evenement;

    const nouveauProprietaire = new EvenementCollaboratifServiceModifie({
      idService: service.id,
      autorisations: [{ idUtilisateur: utilisateur.id, droit: PROPRIETAIRE }],
    });

    await adaptateurJournal.consigneEvenement(nouveauProprietaire.toJSON());
  };
}

module.exports = { consigneProprietaireCreeUnServiceDansJournal };
