import {
  DepotDonneesClesApi,
  PersistanceClesApi,
} from '../../src/depots/depotDonneesClesApi.ts';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { CleApi } from '../../src/modeles/cleApi.ts';
import { ErreurCleApiInexistante } from '../../src/erreurs.ts';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import BusEvenements from '../../src/bus/busEvenements.js';
import { EvenementCleApiCreee } from '../../src/bus/evenementCleApiCreee.ts';
import { EvenementCleApiRevoquee } from '../../src/bus/evenementCleApiRevoquee.ts';

describe("Le dépôt de données des clés d'API", () => {
  let persistance: PersistanceClesApi;
  let busEvenements: ReturnType<typeof fabriqueBusPourLesTests>;

  beforeEach(() => {
    persistance = unePersistanceMemoireTS().construis();
    busEvenements = fabriqueBusPourLesTests();
  });

  const unDepot = () =>
    new DepotDonneesClesApi({
      adaptateurPersistanceTS: persistance,
      adaptateurChiffrement: {
        hacheSha256: (chaine: string) => `v1:${chaine}-hachee`,
      },
      busEvenements: busEvenements as unknown as BusEvenements,
    });

  describe("sur demande d'une nouvelle clé", () => {
    it('renvoie la clé et sa valeur en clair', async () => {
      const { cle, valeurEnClair } = await unDepot().nouvelleCle(
        unUUID('U'),
        30
      );

      expect(cle).toBeInstanceOf(CleApi);
      expect(valeurEnClair).toMatch(/^mss_live_/);
    });

    it("persiste l'empreinte de la clé hachée avec les sels", async () => {
      const { valeurEnClair } = await unDepot().nouvelleCle(unUUID('U'), 30);

      const [cleLue] = await persistance.lisClesApiDe(unUUID('U'));
      expect(cleLue.empreinte).toBe(`v1:${valeurEnClair}-hachee`);
    });

    it("persiste sa date d'expiration selon la durée de validité demandée", async () => {
      const { cle } = await unDepot().nouvelleCle(unUUID('U'), 30);

      const [cleLue] = await persistance.lisClesApiDe(unUUID('U'));
      expect(cleLue.dateExpiration).toEqual(cle.donnees().dateExpiration);
    });

    it('publie un évènement de clé créée sur le bus', async () => {
      const { cle } = await unDepot().nouvelleCle(unUUID('U'), 30);

      expect(busEvenements.recupereEvenement(EvenementCleApiCreee)).toEqual(
        new EvenementCleApiCreee({ cle, dureeValiditeEnJours: 30 })
      );
    });
  });

  describe("sur demande des clés d'un utilisateur", () => {
    it('renvoie uniquement ses clés, sous forme de modèles métier', async () => {
      const depot = unDepot();
      await depot.nouvelleCle(unUUID('U'), 30);
      await depot.nouvelleCle(unUUID('U'), 30);
      await depot.nouvelleCle(unUUID('A'), 30);

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
      const { cle, valeurEnClair } = await depot.nouvelleCle(unUUID('U'), 30);

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
      const { cle } = await depot.nouvelleCle(unUUID('U'), 30);

      await depot.revoqueCle(cle.donnees().id, unUUID('U'));

      const [cleLue] = await depot.lisClesDe(unUUID('U'));
      expect(cleLue.estRevoquee()).toBe(true);
    });

    it('publie un évènement de clé révoquée sur le bus', async () => {
      const depot = unDepot();
      const { cle } = await depot.nouvelleCle(unUUID('U'), 30);

      await depot.revoqueCle(cle.donnees().id, unUUID('U'));

      const evenement = busEvenements.recupereEvenement(
        EvenementCleApiRevoquee
      );
      expect(evenement.cle.donnees().id).toBe(cle.donnees().id);
      expect(evenement.cle.estRevoquee()).toBe(true);
    });

    it("refuse de révoquer la clé d'un autre utilisateur", async () => {
      const depot = unDepot();
      const { cle } = await depot.nouvelleCle(unUUID('U'), 30);

      await expect(
        depot.revoqueCle(cle.donnees().id, unUUID('A'))
      ).rejects.toBeInstanceOf(ErreurCleApiInexistante);

      const [cleLue] = await depot.lisClesDe(unUUID('U'));
      expect(cleLue.estRevoquee()).toBe(false);
      expect(busEvenements.nAPasRecuUnEvenement(EvenementCleApiRevoquee)).toBe(
        true
      );
    });

    it("lève une erreur si la clé n'existe pas", async () => {
      await expect(
        unDepot().revoqueCle(unUUID('C'), unUUID('U'))
      ).rejects.toBeInstanceOf(ErreurCleApiInexistante);
    });
  });
});
