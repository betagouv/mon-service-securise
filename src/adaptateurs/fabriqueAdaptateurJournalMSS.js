import adaptateurJournalMSSMemoire from './adaptateurJournalMSSMemoire.js';
import adaptateurJournalMSSPostgres from './adaptateurJournalMSSPostgres.js';

const fabriqueAdaptateurJournal = () => {
  const adaptateur =
    process.env.AVEC_JOURNAL_EN_MEMOIRE === 'true'
      ? adaptateurJournalMSSMemoire
      : adaptateurJournalMSSPostgres;

  return adaptateur.nouvelAdaptateur();
};

export default fabriqueAdaptateurJournal;
