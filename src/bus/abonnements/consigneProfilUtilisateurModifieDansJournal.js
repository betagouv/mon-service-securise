const EvenementProfilUtilisateurModifie = require('../../modeles/journalMSS/evenementProfilUtilisateurModifie');

function consigneProfilUtilisateurModifieDansJournal({
  adaptateurJournal,
  adaptateurRechercheEntreprise,
}) {
  return async ({ utilisateur }) => {
    if (!utilisateur)
      throw new Error(
        `Impossible de consigner les mises à jour de profil utilisateur sans avoir l'utilisateur en paramètre.`
      );

    const entite =
      await adaptateurRechercheEntreprise.recupereDetailsOrganisation(
        utilisateur.entite.siret
      );

    const profilUtilisateurModifie = new EvenementProfilUtilisateurModifie(
      utilisateur,
      entite
    );

    await adaptateurJournal.consigneEvenement(
      profilUtilisateurModifie.toJSON()
    );
  };
}

module.exports = { consigneProfilUtilisateurModifieDansJournal };
