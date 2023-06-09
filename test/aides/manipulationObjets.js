const toutesValeursEnMajuscules = (donnees) =>
  Object.entries(donnees).reduce(
    (acc, [cle, valeur]) => ({ ...acc, [cle]: valeur.toUpperCase() }),
    {}
  );

module.exports = { toutesValeursEnMajuscules };
