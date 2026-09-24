import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementCleApiCreeeJournal from '../../modeles/journalMSS/evenementCleApiCreee.js';
import { EvenementCleApiCreee } from '../evenementCleApiCreee.js';

const consigneCleApiCreeeDansJournal = consigneDansJournal(
  ({ cle, dureeValiditeEnJours }: EvenementCleApiCreee) => {
    const { id, idUtilisateur, dateCreation, dateExpiration } = cle.donnees();

    return new EvenementCleApiCreeeJournal({
      idCle: id,
      idUtilisateur,
      dureeValiditeEnJours,
      dateCreation,
      dateExpiration,
    });
  }
);

export { consigneCleApiCreeeDansJournal };
