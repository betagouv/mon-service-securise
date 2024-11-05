const creeDepot = ({ adaptateurPersistance }) => {
  const lisSuperviseurs = async (siret) =>
    adaptateurPersistance.lisSuperviseursConcernes(siret);

  return { lisSuperviseurs };
};

module.exports = { creeDepot };
