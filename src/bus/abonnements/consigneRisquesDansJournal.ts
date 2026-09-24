import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementRisquesServiceModifies from '../../modeles/journalMSS/evenementRisquesServiceModifies.js';
import EvenementRisqueServiceModifie from '../evenementRisqueServiceModifie.js';

const consigneRisquesDansJournal = consigneDansJournal(
  ({ service }: EvenementRisqueServiceModifie) =>
    new EvenementRisquesServiceModifies({ service })
);

export { consigneRisquesDansJournal };
