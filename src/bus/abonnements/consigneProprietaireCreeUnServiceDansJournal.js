const {
  EvenementCollaboratifServiceModifie,
} = require('../../modeles/journalMSS/evenementCollaboratifServiceModifie');
const Autorisation = require('../../modeles/autorisations/autorisation');

const { PROPRIETAIRE } = Autorisation.RESUME_NIVEAU_DROIT;

const leveException = (raison) => {
  throw new Error(
    `Impossible de consigner le lien entre un créateur et son service dans le journal MSS sans avoir le ${raison} en paramètre.`
  );
};

function consigneProprietaireCreeUnServiceDansJournal({ adaptateurJournal }) {
  return async (evenement) => {
    const { service, utilisateur } = evenement;

    if (!service) leveException('service');
    if (!utilisateur) leveException('créateur');

    const nouveauProprietaire = new EvenementCollaboratifServiceModifie({
      idService: service.id,
      autorisations: [{ idUtilisateur: utilisateur.id, droit: PROPRIETAIRE }],
    });

    await adaptateurJournal.consigneEvenement(nouveauProprietaire.toJSON());
  };
}

module.exports = { consigneProprietaireCreeUnServiceDansJournal };
