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

  it('sait dire si un jwt a été révoqué, en le hachant', async () => {
    const chiffrement = {
      hacheSha256SansSel: (chaine: string) => `${chaine}-hachee`,
    };
    const persistance = unePersistanceMemoire().construis();
    await persistance.revoqueJwt('jwt-du-test-hachee');
    const depot = creeDepot({ chiffrement, persistance });

    const resultat = await depot.estJwtRevoque('jwt-du-test');
    expect(resultat).toBe(true);

    const unAutreJwt = await depot.estJwtRevoque('un-autre');
    expect(unAutreJwt).toBe(false);
  });
});
