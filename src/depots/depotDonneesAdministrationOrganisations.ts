import { AdaptateurPersistance } from '../adaptateurs/adaptateurPersistance.interface.js';
import { UUID } from '../typesBasiques.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';

export const creeDepot = ({
  persistance,
  chiffrement,
}: {
  persistance: AdaptateurPersistance;
  chiffrement: AdaptateurChiffrement;
}) => {
  const lisAdminsPour = async (siret: string): Promise<Array<UUID>> => {
    const siretHache = chiffrement.hacheSha256(siret);
    return persistance.lisAdminsPour(siretHache);
  };

  return { lisAdminsPour };
};
