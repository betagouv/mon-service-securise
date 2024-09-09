const fabriqueServiceTracking = () => {
  const nombreMoyenContributeursPourUtilisateur = async (
    depotDonnees,
    idUtilisateur
  ) => {
    const services = await depotDonnees.services(idUtilisateur);

    return services.length === 0
      ? 0
      : Math.floor(
          services.reduce(
            (accumulateur, s) => accumulateur + s.contributeurs.length,
            0
          ) / services.length
        );
  };

  const completudeDesServicesPourUtilisateur = async (
    depotDonnees,
    idUtilisateur
  ) => {
    const [nbMoyenContributeurs, services] = await Promise.all([
      nombreMoyenContributeursPourUtilisateur(depotDonnees, idUtilisateur),
      depotDonnees.services(idUtilisateur),
    ]);

    return {
      nombreServices: services.length,
      nombreMoyenContributeurs: nbMoyenContributeurs,
      tauxCompletudeMoyenTousServices: Math.floor(
        (services.reduce((accumulateur, s) => {
          const completudeMesures = s.completudeMesures();
          return (
            accumulateur +
            completudeMesures.nombreMesuresCompletes /
              completudeMesures.nombreTotalMesures
          );
        }, 0) /
          services.length) *
          100
      ),
    };
  };

  return {
    completudeDesServicesPourUtilisateur,
    nombreMoyenContributeursPourUtilisateur,
  };
};

module.exports = { fabriqueServiceTracking };
