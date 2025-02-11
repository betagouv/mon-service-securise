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

const supervision = () => ({
  domaineMetabaseMSS: () =>
    process.env.STATISTIQUES_DOMAINE_METABASE_MSS
      ? new URL('/', process.env.STATISTIQUES_DOMAINE_METABASE_MSS).toString()
      : '',
  cleSecreteIntegrationMetabase: () =>
    process.env.CLE_SECRETE_INTEGRATION_METABASE_MSS,
  identifiantDashboardSupervision: () =>
    parseInt(
      process.env.IDENTIFIANT_DASHBOARD_SUPERVISION_METABASE_MSS ?? '0',
      10
    ),
});

const chiffrement = () => ({
  utiliseChiffrementVault: () =>
    process.env.AVEC_CHIFFREMENT_PAR_VAULT === 'true',
  urlBaseDuService: () => process.env.CHIFFREMENT_URL_BASE_DU_SERVICE,
  cleDuMoteurTransit: () => process.env.CHIFFREMENT_CLE_DU_MOTEUR_TRANSIT,
  tokenVault: () => process.env.CHIFFREMENT_TOKEN_VAULT,
  cleChaCha20Hex: () => process.env.CHIFFREMENT_CLE_CHACHA20_HEX,
  tousLesSelsDeHachage: () =>
    Object.entries(process.env)
      .map(([cle, valeur]) => {
        const matches = cle.match(/SEL_DE_HASHAGE_(\d+)/);
        return [matches ? matches[1] : undefined, valeur];
      })
      .filter(([cle, _]) => !!cle)
      .sort(([version1, _], [version2, __]) => version1 - version2)
      .map(([version, valeur]) => ({
        version: parseInt(version, 10),
        sel: valeur,
      })),
});

const featureFlag = () => ({
  avecServiceMonProfilAnssi: () => process.env.PROFIL_ANSSI_ACTIF === 'true',
  avecAgentConnect: () =>
    process.env.OIDC_URL_BASE &&
    process.env.OIDC_CLIENT_ID &&
    process.env.OIDC_CLIENT_SECRET,
});

const versionDeBuild = () => {
  const versionCommit =
    process.env.CONTAINER_VERSION || process.env.CC_COMMIT_ID || '1';
  return versionCommit.substring(0, 8);
};

const modeMaintenance = () => ({
  actif: () => process.env.MODE_MAINTENANCE === 'true',
  enPreparation: () => !!process.env.PREPARATION_MODE_MAINTENANCE,
  detailsPreparation: () => process.env.PREPARATION_MODE_MAINTENANCE,
});

const oidc = () => ({
  urlRedirectionApresAuthentification: () =>
    `${process.env.URL_BASE_MSS}/oidc/apres-authentification`,
  urlRedirectionApresDeconnexion: () =>
    `${process.env.URL_BASE_MSS}/oidc/apres-deconnexion`,
  urlBase: () => process.env.OIDC_URL_BASE,
  clientId: () => process.env.OIDC_CLIENT_ID,
  clientSecret: () => process.env.OIDC_CLIENT_SECRET,
});

const mss = () => ({
  urlBase: () => process.env.URL_BASE_MSS,
});

module.exports = {
  chiffrement,
  emailMemoire,
  featureFlag,
  filtrageIp,
  journalMSS,
  matomo,
  modeMaintenance,
  mss,
  oidc,
  sendinblue,
  sentry,
  supervision,
  versionDeBuild,
};
