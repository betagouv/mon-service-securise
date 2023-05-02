const emailMemoire = () => ({
  logEmailDansConsole: () => process.env.AVEC_EMAIL_MEMOIRE_QUI_LOG_CONSOLE === 'true',
});

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

const statistiques = () => ({
  domaineMetabaseMSS: () => (process.env.STATISTIQUES_DOMAINE_METABASE_MSS
    ? new URL('/', process.env.STATISTIQUES_DOMAINE_METABASE_MSS).toString()
    : ''),
});

module.exports = { emailMemoire, journalMSS, sendinblue, sentry, statistiques };
