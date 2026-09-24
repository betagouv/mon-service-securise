import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementConnexionUtilisateur from '../../modeles/journalMSS/evenementConnexionUtilisateur.js';
import EvenementNouvelleConnexionUtilisateur from '../evenementNouvelleConnexionUtilisateur.js';

const consigneConnexionUtilisateurDansJournal = consigneDansJournal(
  (evenement: EvenementNouvelleConnexionUtilisateur) =>
    new EvenementConnexionUtilisateur(evenement)
);

export { consigneConnexionUtilisateurDansJournal };
