import { AdaptateurPersistance } from '../adaptateurs/adaptateurPersistance.interface.js';
import { UUID } from '../typesBasiques.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';
import { DepotDonneesAdminsOrganisations } from './depotDonneesAdminsOrganisations.interface.js';
import Entite from '../modeles/entite.js';
import { AdaptateurRechercheEntreprise } from '../adaptateurs/adaptateurRechercheEntreprise.interface.js';

export const creeDepot = ({
  persistance,
  chiffrement,
  adaptateurRechercheEntite,
}: {
  persistance: AdaptateurPersistance;
  chiffrement: AdaptateurChiffrement;
  adaptateurRechercheEntite: AdaptateurRechercheEntreprise;
}): DepotDonneesAdminsOrganisations => {
  const ajouteSiretAAdmin = async (idAdmin: UUID, siret: string) => {
    const entite = await Entite.completeDonnees(
      { siret },
      adaptateurRechercheEntite
    );

    const siretHache = chiffrement.hacheSha256(siret);
    const donneesChiffrees = await chiffrement.chiffre(entite);

    return persistance.ajouteEntiteAAdmin(
      idAdmin,
      siretHache,
      donneesChiffrees
    );
  };

  return {
    ajouteSiretAAdmin,
  };
};
