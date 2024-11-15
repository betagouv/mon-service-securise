const creeDepot = (config = {}) => {
  const { adaptateurPersistance } = config;

  const ajouteParrainage = async (parrainage) =>
    adaptateurPersistance.ajouteParrainage(
      parrainage.idUtilisateurFilleul,
      parrainage.idUtilisateurParrain,
      parrainage.filleulAFinaliseCompte
    );

  return {
    ajouteParrainage,
  };
};
module.exports = { creeDepot };
