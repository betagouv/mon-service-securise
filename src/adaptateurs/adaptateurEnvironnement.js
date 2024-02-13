const emailMemoire = () => ({
  logEmailDansConsole: () =>
    process.env.AVEC_EMAIL_MEMOIRE_QUI_LOG_CONSOLE === 'true',
});

const journalMSS = () => ({
  logEvenementDansConsole: () =>
    process.env.AVEC_JOURNAL_MEMOIRE_QUI_LOG_CONSOLE === 'true',
});

const filtrageIp = () => ({
  ipAutorisees: () => process.env.ADRESSES_IP_AUTORISEES?.split(',') ?? [],
  activerFiltrageIp: () => filtrageIp().ipAutorisees().length > 0,
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

const chiffrement = () => ({
  urlBaseDuService: () => process.env.CHIFFREMENT_URL_BASE_DU_SERVICE,
  cleDuMoteurTransit: () => process.env.CHIFFREMENT_CLE_DU_MOTEUR_TRANSIT,
  tokenVault: () => process.env.CHIFFREMENT_TOKEN_VAULT,
});

module.exports = {
  chiffrement,
  emailMemoire,
  filtrageIp,
  journalMSS,
  matomo,
  sendinblue,
  sentry,
  statistiques,
};
