import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementCguAcceptees from '../../modeles/journalMSS/evenementCguAcceptees.js';
import { EvenementCguAccepteesParUtilisateur } from '../evenementCguAccepteesParUtilisateur.js';

const consigneAcceptationCguDansJournal = consigneDansJournal(
  ({ idUtilisateur, cguAcceptees }: EvenementCguAccepteesParUtilisateur) =>
    new EvenementCguAcceptees({ idUtilisateur, cguAcceptees })
);

export { consigneAcceptationCguDansJournal };
