const Entite = require('../modeles/entite');
const Superviseur = require('../modeles/superviseur');

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

  const superviseur = async (idUtilisateur) => {
    const donneesSuperviseur =
      await adaptateurPersistance.superviseur(idUtilisateur);
    return new Superviseur(donneesSuperviseur);
  };

  const lisSuperviseurs = async (siret) =>
    adaptateurPersistance.lisSuperviseursConcernes(siret);

  return {
    ajouteSiretAuSuperviseur,
    estSuperviseur,
    superviseur,
    lisSuperviseurs,
  };
};

module.exports = { creeDepot };
