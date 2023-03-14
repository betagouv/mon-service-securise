const journalMSS = () => ({
  logEvenementDansConsole: () => process.env.AVEC_JOURNAL_MEMOIRE_QUI_LOG_CONSOLE === 'true',
});

const sendinblue = () => ({
  clefAPI: () => process.env.SENDINBLUE_CLEF_API,
});

const sentry = () => ({
  dsn: () => process.env.SENTRY_DSN,
  environnement: () => process.env.SENTRY_ENVIRONNEMENT,
});

module.exports = { journalMSS, sendinblue, sentry };
