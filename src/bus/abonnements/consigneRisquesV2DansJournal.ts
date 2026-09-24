import { consigneDansJournal } from './consigneDansJournal.js';
import { EvenementRisquesV2ServiceModifies as JournalRisquesV2ServiceModifies } from '../../modeles/journalMSS/evenementRisquesV2ServiceModifies.js';
import { EvenementRisquesV2ServiceModifies as MssRisquesV2ServiceModifies } from '../evenementRisquesV2ServiceModifies.js';

const consigneRisquesV2DansJournal = consigneDansJournal(
  ({ idService, risques }: MssRisquesV2ServiceModifies) =>
    new JournalRisquesV2ServiceModifies({ idService, risques })
);

export { consigneRisquesV2DansJournal };
