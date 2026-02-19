import { journalMSS } from './adaptateurEnvironnement.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from './adaptateurJournalMSS.interface.js';

const nouvelAdaptateur = (): AdaptateurJournalMSS => {
  const consigneEvenement = async (evenement: EvenementJournal) => {
    /* eslint-disable no-console */
    const logDansConsole = journalMSS().logEvenementDansConsole();
    if (logDansConsole)
      console.log(
        `[JOURNAL MSS] Nouvel événement\n${JSON.stringify(evenement)}`
      );
    /* eslint-enable no-console */
  };

  return {
    consigneEvenement,
  };
};

export { nouvelAdaptateur };
