const estUrlLegalePourRedirection = (urlDemandee) =>
  urlDemandee && urlDemandee.startsWith('/') && !urlDemandee.startsWith('/api');

const ajouteLaRedirectionPostConnexion = (urlDemandee) => {
  const redirectionValide = estUrlLegalePourRedirection(urlDemandee);

  if (!redirectionValide) return '/connexion';

  return `/connexion?urlRedirection=${encodeURIComponent(urlDemandee)}`;
};

export { ajouteLaRedirectionPostConnexion, estUrlLegalePourRedirection };
