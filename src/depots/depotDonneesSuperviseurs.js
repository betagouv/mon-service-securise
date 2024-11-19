const Entite = require('../modeles/entite');

const creeDepot = ({ adaptateurPersistance, adaptateurRechercheEntite }) => {
  const ajouteSiretAuSuperviseur = async (idSuperviseur, siret) => {
    const entite = await Entite.completeDonnees(
      { siret },
      adaptateurRechercheEntite
    );
    return adaptateurPersistance.ajouteEntiteAuSuperviseur(
      idSuperviseur,
      entite
    );
  };

  const estSuperviseur = async (idUtilisateur) =>
    adaptateurPersistance.estSuperviseur(idUtilisateur);

  const lisSuperviseurs = async (siret) =>
    adaptateurPersistance.lisSuperviseursConcernes(siret);

  return { ajouteSiretAuSuperviseur, estSuperviseur, lisSuperviseurs };
};

module.exports = { creeDepot };
