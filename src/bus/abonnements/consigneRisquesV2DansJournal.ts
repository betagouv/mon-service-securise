import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import { EvenementRisquesV2ServiceModifies as MssRisquesV2ServiceModifies } from '../evenementRisquesV2ServiceModifies.js';
import { EvenementRisquesV2ServiceModifies as JournalRisquesV2ServiceModifies } from '../../modeles/journalMSS/evenementRisquesV2ServiceModifies.js';

export function consigneRisquesV2DansJournal({
  adaptateurJournal,
}: {
  adaptateurJournal: AdaptateurJournalMSS;
}) {
  return async (evenementMss: MssRisquesV2ServiceModifies) => {
    const evenementJournal = new JournalRisquesV2ServiceModifies(
      evenementMss.idService,
      evenementMss.risques
    );

    await adaptateurJournal.consigneEvenement(evenementJournal.toJSON());
  };
}
