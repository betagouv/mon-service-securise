import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementServiceSupprime from '../../modeles/journalMSS/evenementServiceSupprime.js';
import MssServiceSupprime from '../evenementServiceSupprime.js';

const consigneServiceSupprimeDansJournal = consigneDansJournal(
  ({ idService }: MssServiceSupprime) =>
    new EvenementServiceSupprime({ idService })
);

export { consigneServiceSupprimeDansJournal };
