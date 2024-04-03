const ajouteLaRedirectionPostConnexion = (urlDemandee) => {
  const urlLegalePourRedirection =
    urlDemandee &&
    urlDemandee.startsWith('/') &&
    !urlDemandee.startsWith('/api');

  if (!urlLegalePourRedirection) return '/connexion';

  return `/connexion?urlRedirection=${encodeURIComponent(urlDemandee)}`;
};

module.exports = { ajouteLaRedirectionPostConnexion };
