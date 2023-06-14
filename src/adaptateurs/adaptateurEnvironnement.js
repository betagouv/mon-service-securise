const emailMemoire = () => ({
  logEmailDansConsole: () =>
    process.env.AVEC_EMAIL_MEMOIRE_QUI_LOG_CONSOLE === 'true',
});

const journalMSS = () => ({
  logEvenementDansConsole: () =>
    process.env.AVEC_JOURNAL_MEMOIRE_QUI_LOG_CONSOLE === 'true',
});

const matomo = () => ({
  urlTagManager: () => process.env.MATOMO_URL_TAG_MANAGER,
});

const sendinblue = () => ({
  clefAPIEmail: () => process.env.SENDINBLUE_EMAIL_CLEF_API,
  clefAPITracking: () => process.env.SENDINBLUE_TRACKING_CLEF_API,
  logEvenementsTrackingEnConsole: () =>
    process.env.AVEC_TRACKING_SENDINGBLUE_QUI_LOG_CONSOLE === 'true',
});

const sentry = () => ({
  dsn: () => process.env.SENTRY_DSN,
  environnement: () => process.env.SENTRY_ENVIRONNEMENT,
});

const statistiques = () => ({
  domaineMetabaseMSS: () =>
    process.env.STATISTIQUES_DOMAINE_METABASE_MSS
      ? new URL('/', process.env.STATISTIQUES_DOMAINE_METABASE_MSS).toString()
      : '',
});

module.exports = {
  emailMemoire,
  journalMSS,
  matomo,
  sendinblue,
  sentry,
  statistiques,
};
