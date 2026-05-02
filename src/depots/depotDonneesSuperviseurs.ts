import Entite from '../modeles/entite.js';
import Superviseur, { DonneesSuperviseur } from '../modeles/superviseur.js';
import { AdaptateurPersistance } from '../adaptateurs/adaptateurPersistance.interface.js';
import { AdaptateurRechercheEntreprise } from '../adaptateurs/adaptateurRechercheEntreprise.interface.js';
import { UUID } from '../typesBasiques.js';

const creeDepot = ({
  adaptateurPersistance,
  adaptateurRechercheEntite,
}: {
  adaptateurPersistance: AdaptateurPersistance;
  adaptateurRechercheEntite: AdaptateurRechercheEntreprise;
}) => {
  const ajouteSiretAuSuperviseur = async (
    idSuperviseur: UUID,
    siret: string
  ) => {
    const entite = await Entite.completeDonnees(
      { siret },
      adaptateurRechercheEntite
    );
    return adaptateurPersistance.ajouteEntiteAuSuperviseur(
      idSuperviseur,
      entite
    );
  };

  const estSuperviseur = async (idUtilisateur: UUID) =>
    adaptateurPersistance.estSuperviseur(idUtilisateur);

  const superviseur = async (idUtilisateur: UUID) => {
    const donneesSuperviseur =
      await adaptateurPersistance.superviseur(idUtilisateur);
    return new Superviseur(donneesSuperviseur as DonneesSuperviseur);
  };

  const lisSuperviseurs = async (siret: string) =>
    adaptateurPersistance.lisSuperviseursConcernes(siret);

  const revoqueSuperviseur = async (idUtilisateur: UUID) =>
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
