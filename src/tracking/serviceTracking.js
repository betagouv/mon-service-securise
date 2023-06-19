const creeService = () => {
  const completudeDesServicesPourUtilisateur = (
    depotHomologations,
    idUtilisateur
  ) =>
    depotHomologations
      .nombreMoyenContributeursPourUtilisateur(idUtilisateur)
      .then((nombreMoyenContributeurs) =>
        depotHomologations.homologations(idUtilisateur).then((hs) => ({
          nbServices: hs.length,
          nbMoyenContributeurs: nombreMoyenContributeurs,
          tauxCompletudeMoyenTousServices: Math.floor(
            (hs.reduce((accumulateur, h) => {
              const completudeMesures = h.completudeMesures();
              return (
                accumulateur +
                completudeMesures.nombreMesuresCompletes /
                  completudeMesures.nombreTotalMesures
              );
            }, 0) /
              hs.length) *
              100
          ),
        }))
      );

  const nombreMoyenContributeursPourUtilisateur = (
    depotHomologations,
    idUtilisateur
  ) =>
    depotHomologations
      .homologations(idUtilisateur)
      .then((hs) =>
        hs.length === 0
          ? 0
          : Math.floor(
              hs.reduce(
                (accumulateur, h) => accumulateur + h.contributeurs.length,
                0
              ) / hs.length
            )
      );

  return {
    completudeDesServicesPourUtilisateur,
    nombreMoyenContributeursPourUtilisateur,
  };
};

module.exports = { creeService };
