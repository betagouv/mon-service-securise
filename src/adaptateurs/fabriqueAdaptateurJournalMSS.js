const adaptateurJournalMSSMemoire = require('./adaptateurJournalMSSMemoire');
const adaptateurJournalMSSPostgres = require('./adaptateurJournalMSSPostgres');

const fabriqueAdaptateurJournal = () => {
  const adaptateur =
    process.env.AVEC_JOURNAL_EN_MEMOIRE === 'true'
      ? adaptateurJournalMSSMemoire
      : adaptateurJournalMSSPostgres;

  return adaptateur.nouvelAdaptateur();
};

module.exports = fabriqueAdaptateurJournal;
