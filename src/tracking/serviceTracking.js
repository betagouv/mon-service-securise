const creeService = () => {
  const nombreMoyenContributeursPourUtilisateur = async (
    depotHomologations,
    idUtilisateur
  ) => {
    const hs = await depotHomologations.homologations(idUtilisateur);

    return hs.length === 0
      ? 0
      : Math.floor(
          hs.reduce(
            (accumulateur, h) => accumulateur + h.contributeurs.length,
            0
          ) / hs.length
        );
  };

  const completudeDesServicesPourUtilisateur = async (
    depotHomologations,
    idUtilisateur
  ) => {
    const [nbMoyenContributeurs, hs] = await Promise.all([
      nombreMoyenContributeursPourUtilisateur(
        depotHomologations,
        idUtilisateur
      ),
      depotHomologations.homologations(idUtilisateur),
    ]);

    return {
      nombreServices: hs.length,
      nombreMoyenContributeurs: nbMoyenContributeurs,
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
    };
  };

  return {
    completudeDesServicesPourUtilisateur,
    nombreMoyenContributeursPourUtilisateur,
  };
};

module.exports = { creeService };
