import {
  DepotDonneesClesApi,
  PersistanceClesApi,
} from '../../src/depots/depotDonneesClesApi.ts';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { CleApi } from '../../src/modeles/cleApi.ts';
import { ErreurCleApiInexistante } from '../../src/erreurs.ts';

describe("Le dépôt de données des clés d'API", () => {
  let persistance: PersistanceClesApi;

  beforeEach(() => {
    persistance = unePersistanceMemoireTS().construis();
  });

  const unDepot = () =>
    new DepotDonneesClesApi({
      adaptateurPersistanceTS: persistance,
      adaptateurChiffrement: {
        hacheSha256: (chaine: string) => `v1:${chaine}-hachee`,
      },
    });

  describe("sur demande d'une nouvelle clé", () => {
    it('renvoie la clé et sa valeur en clair', async () => {
      const { cle, valeurEnClair } = await unDepot().nouvelleCle(unUUID('U'));

      expect(cle).toBeInstanceOf(CleApi);
      expect(valeurEnClair).toMatch(/^mss_live_/);
    });

    it("persiste l'empreinte de la clé hachée avec les sels", async () => {
      const { valeurEnClair } = await unDepot().nouvelleCle(unUUID('U'));

      const [cleLue] = await persistance.lisClesApiDe(unUUID('U'));
      expect(cleLue.empreinte).toBe(`v1:${valeurEnClair}-hachee`);
    });
  });

  describe("sur demande des clés d'un utilisateur", () => {
    it('renvoie uniquement ses clés, sous forme de modèles métier', async () => {
      const depot = unDepot();
      await depot.nouvelleCle(unUUID('U'));
      await depot.nouvelleCle(unUUID('U'));
      await depot.nouvelleCle(unUUID('A'));

      const cles = await depot.lisClesDe(unUUID('U'));

      expect(cles).toHaveLength(2);
      expect(cles[0]).toBeInstanceOf(CleApi);
      expect(cles.map((c) => c.donnees().idUtilisateur)).toEqual([
        unUUID('U'),
        unUUID('U'),
      ]);
    });
  });

  describe("sur demande d'une clé à partir de sa valeur en clair", () => {
    it('retrouve la clé correspondante', async () => {
      const depot = unDepot();
      const { cle, valeurEnClair } = await depot.nouvelleCle(unUUID('U'));

      const cleLue = await depot.lisCleParValeur(valeurEnClair);

      expect(cleLue).toBeInstanceOf(CleApi);
      expect(cleLue!.donnees().id).toBe(cle.donnees().id);
    });

    it('reste robuste si aucune clé ne correspond', async () => {
      const cleLue = await unDepot().lisCleParValeur('mss_live_inconnue');

      expect(cleLue).toBeUndefined();
    });
  });

  describe("sur demande de révocation d'une clé", () => {
    it('persiste la révocation', async () => {
      const depot = unDepot();
      const { cle } = await depot.nouvelleCle(unUUID('U'));

      await depot.revoqueCle(cle.donnees().id, unUUID('U'));

      const [cleLue] = await depot.lisClesDe(unUUID('U'));
      expect(cleLue.estRevoquee()).toBe(true);
    });

    it("refuse de révoquer la clé d'un autre utilisateur", async () => {
      const depot = unDepot();
      const { cle } = await depot.nouvelleCle(unUUID('U'));

      await expect(
        depot.revoqueCle(cle.donnees().id, unUUID('A'))
      ).rejects.toBeInstanceOf(ErreurCleApiInexistante);

      const [cleLue] = await depot.lisClesDe(unUUID('U'));
      expect(cleLue.estRevoquee()).toBe(false);
    });

    it("lève une erreur si la clé n'existe pas", async () => {
      await expect(
        unDepot().revoqueCle(unUUID('C'), unUUID('U'))
      ).rejects.toBeInstanceOf(ErreurCleApiInexistante);
    });
  });
});
