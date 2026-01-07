import EvenementConnexionUtilisateur from '../../modeles/journalMSS/evenementConnexionUtilisateur.js';
import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import EvenementNouvelleConnexionUtilisateur from '../evenementNouvelleConnexionUtilisateur.js';

function consigneConnexionUtilisateurDansJournal({
  adaptateurJournal,
}: {
  adaptateurJournal: AdaptateurJournalMSS;
}) {
  return async (evenement: EvenementNouvelleConnexionUtilisateur) => {
    const connexionUtilisateur = new EvenementConnexionUtilisateur(evenement);
    await adaptateurJournal.consigneEvenement(connexionUtilisateur.toJSON());
  };
}

export { consigneConnexionUtilisateurDansJournal };
