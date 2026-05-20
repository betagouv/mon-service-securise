import Entite from '../modeles/entite.js';
import { AdaptateurPersistance } from '../adaptateurs/adaptateurPersistance.interface.js';
import { AdaptateurRechercheEntreprise } from '../adaptateurs/adaptateurRechercheEntreprise.interface.js';
import { UUID } from '../typesBasiques.js';
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

  const lisSuperviseurs = async (siret: string) => {
    const siretHache = adaptateurChiffrement.hacheSha256(siret);
    return adaptateurPersistance.lisSuperviseursConcernes(siretHache);
  };

  const revoqueSuperviseur = async (idUtilisateur: UUID) =>
    adaptateurPersistance.revoqueSuperviseur(idUtilisateur);

  return {
    ajouteSiretAuSuperviseur,
    lisSuperviseurs,
    revoqueSuperviseur,
  };
};

export { creeDepot };
