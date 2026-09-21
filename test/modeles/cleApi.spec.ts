import { CleApi } from '../../src/modeles/cleApi.ts';
import { unUUID } from '../constructeurs/UUID.ts';

describe("Une clé d'API", () => {
  const hacheurDeTest = (valeur: string) => `${valeur}-hachee`;

  describe('à sa création', () => {
    it("appartient à l'utilisateur qui la demande", () => {
      const { cle } = CleApi.nouvelle(unUUID('U'), hacheurDeTest);

      expect(cle.donnees().idUtilisateur).toBe(unUUID('U'));
    });

    it('fournit une valeur en clair au format « mss_live_<préfixe>_<secret> »', () => {
      const { valeurEnClair } = CleApi.nouvelle(unUUID('U'), hacheurDeTest);

      expect(valeurEnClair).toMatch(/^mss_live_[0-9a-f]{8}_[A-Za-z0-9_-]{43}$/);
    });

    it('conserve uniquement le préfixe de la valeur en clair, pour pouvoir identifier la clé', () => {
      const { cle, valeurEnClair } = CleApi.nouvelle(
        unUUID('U'),
        hacheurDeTest
      );

      const [, , prefixe] = valeurEnClair.split('_');
      expect(cle.donnees().prefixe).toBe(prefixe);
    });

    it("conserve l'empreinte de la valeur en clair, jamais la valeur elle-même", () => {
      const { cle, valeurEnClair } = CleApi.nouvelle(
        unUUID('U'),
        hacheurDeTest
      );

      expect(cle.donnees().empreinte).toBe(`${valeurEnClair}-hachee`);
      expect(JSON.stringify(cle.donnees())).not.toContain(`"${valeurEnClair}"`);
    });

    it('génère une valeur différente à chaque création', () => {
      const premiere = CleApi.nouvelle(unUUID('U'), hacheurDeTest);
      const seconde = CleApi.nouvelle(unUUID('U'), hacheurDeTest);

      expect(premiere.valeurEnClair).not.toBe(seconde.valeurEnClair);
      expect(premiere.cle.donnees().id).not.toBe(seconde.cle.donnees().id);
    });

    it("n'est pas révoquée", () => {
      const { cle } = CleApi.nouvelle(unUUID('U'), hacheurDeTest);

      expect(cle.estRevoquee()).toBe(false);
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
