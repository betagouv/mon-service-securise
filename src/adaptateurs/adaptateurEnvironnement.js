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
  sampleRateDuTracing: () =>
    Number(process.env.SENTRY_SAMPLE_RATE_DU_TRACING) || 0,
  cheminsIgnoresParTracing: () =>
    process.env.SENTRY_CHEMINS_IGNORES_PAR_TRACING?.split(',') ?? [],
});

const statistiques = () => ({
  domaineMetabaseMSS: () =>
    process.env.STATISTIQUES_DOMAINE_METABASE_MSS
      ? new URL('/', process.env.STATISTIQUES_DOMAINE_METABASE_MSS).toString()
      : '',
});

const chiffrement = () => ({
  utiliseChiffrementVault: () =>
    process.env.AVEC_CHIFFREMENT_PAR_VAULT === 'true',
  urlBaseDuService: () => process.env.CHIFFREMENT_URL_BASE_DU_SERVICE,
  cleDuMoteurTransit: () => process.env.CHIFFREMENT_CLE_DU_MOTEUR_TRANSIT,
  tokenVault: () => process.env.CHIFFREMENT_TOKEN_VAULT,
});

const featureFlag = () => ({
  visiteGuideeActive: () => process.env.FEATURE_FLAG_VISITE_GUIDEE === 'true',
  avecPlanAction: () =>
    process.env.VITE_FEATURE_FLAG_AVEC_PLAN_ACTION === 'true',
});

const versionDeBuild = () => {
  const versionCommit =
    process.env.CONTAINER_VERSION || process.env.CC_COMMIT_ID || '1';
  return versionCommit.substring(0, 8);
};

module.exports = {
  chiffrement,
  emailMemoire,
  featureFlag,
  filtrageIp,
  journalMSS,
  matomo,
  sendinblue,
  sentry,
  statistiques,
  versionDeBuild,
};
