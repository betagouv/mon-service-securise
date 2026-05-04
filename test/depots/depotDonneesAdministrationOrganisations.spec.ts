import { creeDepot } from '../../src/depots/depotDonneesAdministrationOrganisations.ts';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import { AdaptateurPersistance } from '../../src/adaptateurs/adaptateurPersistance.interface.ts';
import { AdaptateurChiffrement } from '../../src/adaptateurs/adaptateurChiffrement.interface.ts';

describe("Le dépôt de données d'admin des organisations", () => {
  describe("concernant la lecture des admins d'une organisation", () => {
    it('appelle la persistance avec un SIRET haché', async () => {
      let siretPersistance;

      const depot = creeDepot({
        persistance: {
          lisAdminsPour: (siret: string) => {
            siretPersistance = siret;
            return [];
          },
        } as unknown as AdaptateurPersistance,
        chiffrement:
          fauxAdaptateurChiffrement() as unknown as AdaptateurChiffrement,
      });

      await depot.lisAdminsPour('SIRET');

      expect(siretPersistance).toBe('SIRET-haché256');
    });
  });
});
