import { AdaptateurPersistance } from '../adaptateurs/adaptateurPersistance.interface.js';
import { UUID } from '../typesBasiques.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';
import { DepotDonneesAdministrationOrganisationsInterface } from './depotDonneesAdministrationOrganisations.interface.js';
import Entite from '../modeles/entite.js';

export const creeDepot = ({
  persistance,
  chiffrement,
}: {
  persistance: AdaptateurPersistance;
  chiffrement: AdaptateurChiffrement;
}): DepotDonneesAdministrationOrganisationsInterface => {
  const lisAdminsPour = async (siret: string): Promise<Array<UUID>> => {
    const siretHache = chiffrement.hacheSha256(siret);
    return persistance.lisAdminsPour(siretHache);
  };

  const entitesDansPerimetreDe = async (
    idUtilisateur: UUID
  ): Promise<Array<Entite>> => [
    new Entite({
      siret: '123',
      nom: `Une entite dans le périmètre de ${idUtilisateur}`,
      departement: '33',
    }),
  ];

  return { lisAdminsPour, entitesDansPerimetreDe };
};
