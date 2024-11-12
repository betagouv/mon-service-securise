const creeDepot = ({ adaptateurPersistance }) => {
  const ajouteSiretAuSuperviseur = async (idSuperviseur, siret) =>
    adaptateurPersistance.ajouteSiretAuSuperviseur(idSuperviseur, siret);

  const estSuperviseur = async (idUtilisateur) =>
    adaptateurPersistance.estSuperviseur(idUtilisateur);

  const lisSuperviseurs = async (siret) =>
    adaptateurPersistance.lisSuperviseursConcernes(siret);

  return { ajouteSiretAuSuperviseur, estSuperviseur, lisSuperviseurs };
};

module.exports = { creeDepot };
