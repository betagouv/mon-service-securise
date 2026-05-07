import Entite, { DonneesEntite } from '../modeles/entite.js';
import Superviseur from '../modeles/superviseur.js';
import { AdaptateurPersistance } from '../adaptateurs/adaptateurPersistance.interface.js';
import { AdaptateurRechercheEntreprise } from '../adaptateurs/adaptateurRechercheEntreprise.interface.js';
import { DonneesChiffrees, UUID } from '../typesBasiques.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';

const creeDepot = ({
  adaptateurPersistance,
  adaptateurRechercheEntite,
  adaptateurChiffrement,
}: {
  adaptateurPersistance: AdaptateurPersistance;
  adaptateurRechercheEntite: AdaptateurRechercheEntreprise;
  adaptateurChiffrement: AdaptateurChiffrement;
}) => {
  const ajouteSiretAuSuperviseur = async (
    idSuperviseur: UUID,
    siret: string
  ) => {
    const entite = await Entite.completeDonnees(
      { siret },
      adaptateurRechercheEntite
    );

    const siretHache = adaptateurChiffrement.hacheSha256(siret);
    const donneesChiffrees = await adaptateurChiffrement.chiffre(entite);

    return adaptateurPersistance.ajouteEntiteAuSuperviseur(
      idSuperviseur,
      siretHache,
      donneesChiffrees
    );
  };

  const estSuperviseur = async (idUtilisateur: UUID) =>
    adaptateurPersistance.estSuperviseur(idUtilisateur);

  const superviseur = async (idUtilisateur: UUID) => {
    const donneesSuperviseur =
      await adaptateurPersistance.superviseur(idUtilisateur);
    if (!donneesSuperviseur) return undefined;

    const entitesSupervisees = await Promise.all<DonneesEntite>(
      donneesSuperviseur.donnees.map((d: DonneesChiffrees) =>
        adaptateurChiffrement.dechiffre(d)
      )
    );

    return new Superviseur({ idUtilisateur, entitesSupervisees });
  };

  const lisSuperviseurs = async (siret: string) => {
    const siretHache = adaptateurChiffrement.hacheSha256(siret);
    return adaptateurPersistance.lisSuperviseursConcernes(siretHache);
  };

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
