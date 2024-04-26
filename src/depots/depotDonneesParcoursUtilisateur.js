const ParcoursUtilisateur = require('../modeles/parcoursUtilisateur');

const creeDepot = (config = {}) => {
  const { adaptateurPersistance, referentiel } = config;

  const lisParcoursUtilisateur = async (idUtilisateur) => {
    const parcoursConnu =
      await adaptateurPersistance.lisParcoursUtilisateur(idUtilisateur);
    return parcoursConnu
      ? new ParcoursUtilisateur(parcoursConnu, referentiel)
      : ParcoursUtilisateur.pourUtilisateur(idUtilisateur, referentiel);
  };

  const sauvegardeParcoursUtilisateur = async (parcoursUtilisateur) => {
    await adaptateurPersistance.sauvegardeParcoursUtilisateur(
      parcoursUtilisateur.idUtilisateur,
      parcoursUtilisateur.donneesSerialisees()
    );
  };

  return {
    lisParcoursUtilisateur,
    sauvegardeParcoursUtilisateur,
  };
};

module.exports = { creeDepot };
