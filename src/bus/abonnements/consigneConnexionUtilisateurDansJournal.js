import EvenementConnexionUtilisateur from '../../modeles/journalMSS/evenementConnexionUtilisateur.js';

function consigneConnexionUtilisateurDansJournal({ adaptateurJournal }) {
  return async (donnees) => {
    const connexionUtilisateur = new EvenementConnexionUtilisateur(donnees);
    await adaptateurJournal.consigneEvenement(connexionUtilisateur.toJSON());
  };
}

export { consigneConnexionUtilisateurDansJournal };
