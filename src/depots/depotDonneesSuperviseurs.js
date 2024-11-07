const creeDepot = ({ adaptateurPersistance }) => {
  const ajouteSiretAuSuperviseur = async (idSuperviseur, siret) =>
    adaptateurPersistance.ajouteSiretAuSuperviseur(idSuperviseur, siret);

  const lisSuperviseurs = async (siret) =>
    adaptateurPersistance.lisSuperviseursConcernes(siret);

  return { ajouteSiretAuSuperviseur, lisSuperviseurs };
};

module.exports = { creeDepot };
