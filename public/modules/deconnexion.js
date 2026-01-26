const leProchainMinuitUtc = () => {
  const maintenant = new Date();

  return new Date(
    Date.UTC(
      maintenant.getUTCFullYear(),
      maintenant.getUTCMonth(),
      maintenant.getUTCDate() + 1,
      0,
      0,
      0,
      0
    )
  );
};

export const afficheModaleDeconnexion = () => {
  $('.rideau').trigger('fermeModale');
  $('.rideau#deconnexion').trigger('afficheModale');
};

export const lanceDecompteDeconnexion = () => {
  const aMinuit = leProchainMinuitUtc().getTime();
  const tempsRestant = aMinuit - Date.now();

  setTimeout(() => {
    afficheModaleDeconnexion();
  }, tempsRestant);
};
