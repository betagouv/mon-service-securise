import { creeDepot } from '../../src/depots/depotDonneesSession.ts';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';

describe('Le dépôt de données des sessions', () => {
  describe("sur demande de révocation d'une session", () => {
    it("hache le JWT qu'on lui passe", async () => {
      const chiffrement = {
        hacheSha256SansSel: (chaine: string) => `${chaine}-hachee`,
      };
      const persistance = unePersistanceMemoire().construis();
      const depot = creeDepot({ chiffrement, persistance });

      await depot.revoqueJwt('jwt-du-test');

      const resultat = await persistance.estJwtRevoque('jwt-du-test-hachee');
      expect(resultat).toBe(true);
    });
  });
});
