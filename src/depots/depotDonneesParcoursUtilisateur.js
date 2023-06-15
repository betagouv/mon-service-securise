const ParcoursUtilisateur = require('../modeles/parcoursUtilisateur');

const creeDepot = (config = {}) => {
  const { adaptateurPersistance } = config;

  const lisParcoursUtilisateur = async (idUtilisateur) => {
    const parcoursConnu = await adaptateurPersistance.lisParcoursUtilisateur(
      idUtilisateur
    );
    return new ParcoursUtilisateur(parcoursConnu ?? { idUtilisateur });
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
