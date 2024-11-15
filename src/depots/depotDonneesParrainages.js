const Parrainage = require('../modeles/parrainage');

const creeDepot = (config = {}) => {
  const { adaptateurPersistance } = config;

  const ajouteParrainage = async (parrainage) =>
    adaptateurPersistance.ajouteParrainage(
      parrainage.idUtilisateurFilleul,
      parrainage.idUtilisateurParrain,
      parrainage.filleulAFinaliseCompte
    );

  const parrainagePour = async (idUtilisateurFilleul) => {
    const donnees =
      await adaptateurPersistance.parrainagePour(idUtilisateurFilleul);
    return donnees ? new Parrainage(donnees) : undefined;
  };

  const metsAJourParrainage = async (parrainage) =>
    adaptateurPersistance.metsAJourParrainage(
      parrainage.idUtilisateurFilleul,
      parrainage.filleulAFinaliseCompte
    );

  return {
    ajouteParrainage,
    parrainagePour,
    metsAJourParrainage,
  };
};
module.exports = { creeDepot };
