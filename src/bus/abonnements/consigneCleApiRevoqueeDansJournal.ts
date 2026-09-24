import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementCleApiRevoqueeJournal from '../../modeles/journalMSS/evenementCleApiRevoquee.js';
import { EvenementCleApiRevoquee } from '../evenementCleApiRevoquee.js';

const consigneCleApiRevoqueeDansJournal = consigneDansJournal(
  ({ cle }: EvenementCleApiRevoquee) => {
    const { id, idUtilisateur, dateRevocation } = cle.donnees();

    return new EvenementCleApiRevoqueeJournal({
      idCle: id,
      idUtilisateur,
      dateRevocation: dateRevocation!,
    });
  }
);

export { consigneCleApiRevoqueeDansJournal };
