const pourChaqueLigne = (requete, miseAJour) =>
  import('p-map').then((module) => {
    const pMap = module.default;

    return requete.then((lignes) =>
      pMap(lignes, miseAJour, { concurrency: 2 })
    );
  });

module.exports = pourChaqueLigne;
