import Entite from '../modeles/entite.js';
import Superviseur from '../modeles/superviseur.js';

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

  const revoqueSuperviseur = async (idUtilisateur) =>
    adaptateurPersistance.revoqueSuperviseur(idUtilisateur);

  return {
    ajouteSiretAuSuperviseur,
    estSuperviseur,
    superviseur,
    lisSuperviseurs,
    revoqueSuperviseur,
  };
};

export { creeDepot };
