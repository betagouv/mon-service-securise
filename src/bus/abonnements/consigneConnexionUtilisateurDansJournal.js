const EvenementConnexionUtilisateur = require('../../modeles/journalMSS/evenementConnexionUtilisateur');

function consigneConnexionUtilisateurDansJournal({ adaptateurJournal }) {
  return async (donnees) => {
    const connexionUtilisateur = new EvenementConnexionUtilisateur(donnees);
    await adaptateurJournal.consigneEvenement(connexionUtilisateur.toJSON());
  };
}

module.exports = { consigneConnexionUtilisateurDansJournal };
