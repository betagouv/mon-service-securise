const fabriqueServiceTracking = () => {
  const nombreMoyenContributeurs = async (services) =>
    services.length === 0
      ? 0
      : Math.floor(
          services.reduce(
            (accumulateur, s) => accumulateur + s.contributeurs.length,
            0
          ) / services.length
        );

  const nombreMoyenContributeursPourUtilisateur = async (
    depotDonnees,
    idUtilisateur
  ) => {
    const services = await depotDonnees.services(idUtilisateur);
    return nombreMoyenContributeurs(services);
  };

  const completudeDesServicesPourUtilisateur = async (
    depotDonnees,
    idUtilisateur
  ) => {
    const services = await depotDonnees.services(idUtilisateur);
    const nbMoyenContributeurs = await nombreMoyenContributeurs(services);
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
