const EvenementNouvelUtilisateurInscrit = require('../../modeles/journalMSS/evenementNouvelUtilisateurInscrit');

function consigneNouvelUtilisateurInscritDansJournal({ adaptateurJournal }) {
  return async ({ utilisateur }) => {
    if (!utilisateur)
      throw new Error(
        "Impossible de consigner l'inscription d'un utilisateur sans avoir l'utilisateur en paramètre."
      );

    const profilUtilisateurModifie = new EvenementNouvelUtilisateurInscrit({
      idUtilisateur: utilisateur.id,
    });

    await adaptateurJournal.consigneEvenement(
      profilUtilisateurModifie.toJSON()
    );
  };
}

module.exports = { consigneNouvelUtilisateurInscritDansJournal };
