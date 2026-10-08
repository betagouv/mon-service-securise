import { GroupeEntites } from '../../src/modeles/groupeEntites.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { ErreurLibelleGroupeEntitesInvalide } from '../../src/erreurs.ts';

describe("Un groupe d'entités", () => {
  describe('à sa création', () => {
    it("appartient à l'utilisateur qui le crée", () => {
      const groupe = GroupeEntites.nouveau(unUUID('U'), 'Région Nord');

      expect(groupe.donnees().idUtilisateur).toBe(unUUID('U'));
    });

    it('reçoit un identifiant', () => {
      const groupe = GroupeEntites.nouveau(unUUID('U'), 'Région Nord');

      expect(groupe.donnees().id).toBeDefined();
    });

    it('retire les espaces en début et fin de libellé', () => {
      const groupe = GroupeEntites.nouveau(unUUID('U'), '   Région Nord  ');

      expect(groupe.donnees().libelle).toBe('Région Nord');
    });

    it('refuse un libellé vide ou composé uniquement d’espaces', () => {
      expect(() => GroupeEntites.nouveau(unUUID('U'), '')).toThrow(
        ErreurLibelleGroupeEntitesInvalide
      );
      expect(() => GroupeEntites.nouveau(unUUID('U'), '   ')).toThrow(
        ErreurLibelleGroupeEntitesInvalide
      );
    });
  });

  describe('lorsqu’il est renommé', () => {
    it('prend le nouveau libellé, débarrassé de ses espaces superflus', () => {
      const groupe = GroupeEntites.nouveau(unUUID('U'), 'Région Nord');

      groupe.renomme('  Région Sud  ');

      expect(groupe.donnees().libelle).toBe('Région Sud');
    });

    it('refuse un libellé vide', () => {
      const groupe = GroupeEntites.nouveau(unUUID('U'), 'Région Nord');

      expect(() => groupe.renomme('  ')).toThrow(
        ErreurLibelleGroupeEntitesInvalide
      );
      expect(groupe.donnees().libelle).toBe('Région Nord');
    });
  });

  it('peut être reconstitué à partir de ses données', () => {
    const donnees = {
      id: unUUID('G'),
      idUtilisateur: unUUID('U'),
      libelle: 'Région Nord',
      siretsAssocies: ['12345678900011'],
    };

    const groupe = GroupeEntites.hydrate(donnees);

    expect(groupe.donnees()).toEqual(donnees);
  });

  it("se sérialise en JSON avec son identifiant, son libellé et ses sirets associés, sans l'identifiant de l'utilisateur", () => {
    const groupe = GroupeEntites.hydrate({
      id: unUUID('G'),
      idUtilisateur: unUUID('U'),
      libelle: 'Région Nord',
      siretsAssocies: ['12345678900011'],
    });

    expect(groupe.toJSON()).toEqual({
      id: unUUID('G'),
      libelle: 'Région Nord',
      siretsAssocies: ['12345678900011'],
    });
  });
});
