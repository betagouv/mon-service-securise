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

  return {
    completudeDesServicesPourUtilisateur,
  };
};

module.exports = { creeService };
