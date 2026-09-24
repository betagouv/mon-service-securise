import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementNouvelUtilisateurInscrit from '../../modeles/journalMSS/evenementNouvelUtilisateurInscrit.js';
import EvenementUtilisateurInscrit from '../evenementUtilisateurInscrit.js';

const consigneNouvelUtilisateurInscritDansJournal = consigneDansJournal(
  ({ utilisateur }: EvenementUtilisateurInscrit) =>
    new EvenementNouvelUtilisateurInscrit({ idUtilisateur: utilisateur.id })
);

export { consigneNouvelUtilisateurInscritDansJournal };
