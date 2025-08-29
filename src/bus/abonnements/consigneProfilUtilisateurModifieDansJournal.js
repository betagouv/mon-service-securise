import EvenementProfilUtilisateurModifie from '../../modeles/journalMSS/evenementProfilUtilisateurModifie.js';

function consigneProfilUtilisateurModifieDansJournal({ adaptateurJournal }) {
  return async ({ utilisateur }) => {
    if (!utilisateur)
      throw new Error(
        `Impossible de consigner les mises à jour de profil utilisateur sans avoir l'utilisateur en paramètre.`
      );

    const profilUtilisateurModifie = new EvenementProfilUtilisateurModifie(
      utilisateur
    );

    await adaptateurJournal.consigneEvenement(
      profilUtilisateurModifie.toJSON()
    );
  };
}

export { consigneProfilUtilisateurModifieDansJournal };
