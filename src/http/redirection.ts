const estUrlLegalePourRedirection = (urlDemandee) =>
  urlDemandee && urlDemandee.startsWith('/') && !urlDemandee.startsWith('/api');

const ajouteLaRedirectionPostConnexion = (urlDemandee) => {
  const redirectionValide = estUrlLegalePourRedirection(urlDemandee);

  if (!redirectionValide) return '/connexion';

  return `/connexion?urlRedirection=${encodeURIComponent(urlDemandee)}`;
};

const construisUrlAbsolueVersPage = (page) => process.env.URL_BASE_MSS + page;

module.exports = {
  ajouteLaRedirectionPostConnexion,
  construisUrlAbsolueVersPage,
  estUrlLegalePourRedirection,
};
