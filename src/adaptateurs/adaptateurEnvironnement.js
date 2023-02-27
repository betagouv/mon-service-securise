const sendinblue = () => ({
  clefAPI: () => process.env.SENDINBLUE_CLEF_API,
});

const journalMSS = () => ({
  logEvenementDansConsole: () => process.env.AVEC_JOURNAL_MEMOIRE_QUI_LOG_CONSOLE === 'true',
});

module.exports = { sendinblue, journalMSS };
