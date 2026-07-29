import * as adaptateurJournalMSSMemoire from './adaptateurJournalMSSMemoire.js';
import { AdaptateurJournalMSSPostgres } from './adaptateurJournalMSSPostgres.js';

const fabriqueAdaptateurJournal = () => {
  if (process.env.AVEC_JOURNAL_EN_MEMOIRE === 'true')
    return adaptateurJournalMSSMemoire.nouvelAdaptateur();

  return new AdaptateurJournalMSSPostgres();
};

export default fabriqueAdaptateurJournal;
