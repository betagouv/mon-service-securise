import { creeDepot } from '../../src/depots/depotDonneesSession.ts';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';

describe('Le dépôt de données des sessions', () => {
  const vingtTroisJanvier = 1769181158; // … 23/01/2026 16h12m38s
  const decodeJwtAu23Janvier = () => ({ exp: vingtTroisJanvier });

  const chiffrement = {
    hacheSha256SansSel: (chaine: string) => `${chaine}-hachee`,
  };

  describe("sur demande de révocation d'une session", () => {
    it("hache le JWT qu'on lui passe", async () => {
      const persistance = unePersistanceMemoire().construis();
      const depot = creeDepot({
        chiffrement,
        persistance,
        decodeJwt: decodeJwtAu23Janvier,
      });

      await depot.revoqueJwt('jwt-du-test');

      const resultat = await persistance.estJwtRevoque('jwt-du-test-hachee');
      expect(resultat).toBe(true);
    });

    it("fait passer à la persistance la date d'expiration du JWT", async () => {
      let datePersistee;

      const persistance = unePersistanceMemoire().construis();
      persistance.revoqueJwt = async (_, dateExpiration) => {
        datePersistee = dateExpiration;
      };

      const depot = creeDepot({
        chiffrement,
        persistance,
        decodeJwt: decodeJwtAu23Janvier,
      });

      await depot.revoqueJwt('jwt-du-test');

      expect(datePersistee).toEqual(new Date('2026-01-23T15:12:38.000Z'));
    });
  });

  it('sait dire si un jwt a été révoqué, en le hachant', async () => {
    const persistance = unePersistanceMemoire().construis();
    await persistance.revoqueJwt('jwt-du-test-hachee');
    const depot = creeDepot({
      chiffrement,
      persistance,
      decodeJwt: decodeJwtAu23Janvier,
    });

    const resultat = await depot.estJwtRevoque('jwt-du-test');
    expect(resultat).toBe(true);

    const unAutreJwt = await depot.estJwtRevoque('un-autre');
    expect(unAutreJwt).toBe(false);
  });
});
