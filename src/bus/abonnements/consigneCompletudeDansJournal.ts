import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementCompletudeServiceModifiee from '../../modeles/journalMSS/evenementCompletudeServiceModifiee.js';
import Service from '../../modeles/service.js';

const consigneCompletudeDansJournal = consigneDansJournal(
  ({ service }: { service: Service }) =>
    new EvenementCompletudeServiceModifiee({ service })
);

export { consigneCompletudeDansJournal };
