import { CleApi } from '../../src/modeles/cleApi.ts';
import { unUUID } from '../constructeurs/UUID.ts';

describe("Une clé d'API", () => {
  const hacheurDeTest = (valeur: string) => `${valeur}-hachee`;

  describe('à sa création', () => {
    it("appartient à l'utilisateur qui la demande", () => {
      const { cle } = CleApi.nouvelle(unUUID('U'), 30, hacheurDeTest);

      expect(cle.donnees().idUtilisateur).toBe(unUUID('U'));
    });

    it('fournit une valeur en clair au format « mss_live_<préfixe>_<secret> »', () => {
      const { valeurEnClair } = CleApi.nouvelle(unUUID('U'), 30, hacheurDeTest);

      expect(valeurEnClair).toMatch(/^mss_live_[0-9a-f]{8}_[A-Za-z0-9_-]{43}$/);
    });

    it('conserve uniquement le préfixe de la valeur en clair, pour pouvoir identifier la clé', () => {
      const { cle, valeurEnClair } = CleApi.nouvelle(
        unUUID('U'),
        30,
        hacheurDeTest
      );

      const [, , prefixe] = valeurEnClair.split('_');
      expect(cle.donnees().prefixe).toBe(prefixe);
    });

    it("conserve l'empreinte de la valeur en clair, jamais la valeur elle-même", () => {
      const { cle, valeurEnClair } = CleApi.nouvelle(
        unUUID('U'),
        30,
        hacheurDeTest
      );

      expect(cle.donnees().empreinte).toBe(`${valeurEnClair}-hachee`);
      expect(JSON.stringify(cle.donnees())).not.toContain(`"${valeurEnClair}"`);
    });

    it('génère une valeur différente à chaque création', () => {
      const premiere = CleApi.nouvelle(unUUID('U'), 30, hacheurDeTest);
      const seconde = CleApi.nouvelle(unUUID('U'), 30, hacheurDeTest);

      expect(premiere.valeurEnClair).not.toBe(seconde.valeurEnClair);
      expect(premiere.cle.donnees().id).not.toBe(seconde.cle.donnees().id);
    });

    it("n'est pas révoquée", () => {
      const { cle } = CleApi.nouvelle(unUUID('U'), 30, hacheurDeTest);

      expect(cle.estRevoquee()).toBe(false);
    });

    it('expire après la durée de validité demandée, à compter de sa création', () => {
      const { cle } = CleApi.nouvelle(unUUID('U'), 30, hacheurDeTest);

      const { dateCreation, dateExpiration } = cle.donnees();
      const differenceEnJours =
        (dateExpiration.getTime() - dateCreation.getTime()) /
        (1000 * 60 * 60 * 24);
      expect(differenceEnJours).toBeCloseTo(30, 5);
    });
  });

  describe('sur vérification de son expiration', () => {
    const uneCleExpirantLe = (dateExpiration: Date) =>
      CleApi.hydrate({
        id: unUUID('C'),
        idUtilisateur: unUUID('U'),
        prefixe: '7f3a91c4',
        empreinte: 'empreinte',
        dateCreation: new Date('2026-09-01'),
        dateExpiration,
      });

    it("n'est pas expirée avant sa date d'expiration", () => {
      const cle = uneCleExpirantLe(new Date('2026-10-01'));

      expect(cle.estExpiree(new Date('2026-09-15'))).toBe(false);
    });

    it("est expirée à sa date d'expiration", () => {
      const cle = uneCleExpirantLe(new Date('2026-10-01'));

      expect(cle.estExpiree(new Date('2026-10-01'))).toBe(true);
    });

    it("reste expirée après sa date d'expiration", () => {
      const cle = uneCleExpirantLe(new Date('2026-10-01'));

      expect(cle.estExpiree(new Date('2026-11-01'))).toBe(true);
    });

    it("utilise l'instant présent quand aucune date n'est précisée", () => {
      const dejaExpiree = uneCleExpirantLe(new Date('2020-01-01'));
      const pasEncoreExpiree = uneCleExpirantLe(new Date('2999-01-01'));

      expect(dejaExpiree.estExpiree()).toBe(true);
      expect(pasEncoreExpiree.estExpiree()).toBe(false);
    });
  });

  describe('sur vérification de sa validité', () => {
    const uneCle = ({
      dateExpiration,
      dateRevocation,
    }: {
      dateExpiration: Date;
      dateRevocation?: Date;
    }) =>
      CleApi.hydrate({
        id: unUUID('C'),
        idUtilisateur: unUUID('U'),
        prefixe: '7f3a91c4',
        empreinte: 'empreinte',
        dateCreation: new Date('2026-09-01'),
        dateExpiration,
        dateRevocation,
      });

    it('est valide si elle n’est ni révoquée ni expirée', () => {
      const cle = uneCle({ dateExpiration: new Date('2999-01-01') });

      expect(cle.estValide(new Date('2026-09-15'))).toBe(true);
    });

    it('n’est pas valide si elle est révoquée', () => {
      const cle = uneCle({
        dateExpiration: new Date('2999-01-01'),
        dateRevocation: new Date('2026-09-02'),
      });

      expect(cle.estValide(new Date('2026-09-15'))).toBe(false);
    });

    it("n'est pas valide si elle est expirée", () => {
      const cle = uneCle({ dateExpiration: new Date('2020-01-01') });

      expect(cle.estValide(new Date('2026-09-15'))).toBe(false);
    });

    it("utilise l'instant présent quand aucune date n'est précisée", () => {
      const cle = uneCle({ dateExpiration: new Date('2999-01-01') });

      expect(cle.estValide()).toBe(true);
    });
  });

  describe('sur demande de révocation', () => {
    const uneCleActive = () =>
      CleApi.hydrate({
        id: unUUID('C'),
        idUtilisateur: unUUID('U'),
        prefixe: '7f3a91c4',
        empreinte: 'empreinte',
        dateCreation: new Date('2026-09-01'),
        dateExpiration: new Date('2027-09-01'),
      });

    it('est révoquée à la date donnée', () => {
      const cle = uneCleActive();

      cle.revoque(new Date('2026-09-21'));

      expect(cle.estRevoquee()).toBe(true);
      expect(cle.donnees().dateRevocation).toEqual(new Date('2026-09-21'));
    });

    it('conserve la date de sa première révocation', () => {
      const cle = uneCleActive();
      cle.revoque(new Date('2026-09-21'));

      cle.revoque(new Date('2026-10-01'));

      expect(cle.donnees().dateRevocation).toEqual(new Date('2026-09-21'));
    });
  });
});
