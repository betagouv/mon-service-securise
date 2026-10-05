import { GroupeServices } from '../../src/modeles/groupeServices.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { ErreurLibelleGroupeServicesInvalide } from '../../src/erreurs.ts';

describe('Un groupe de services', () => {
  describe('à sa création', () => {
    it("appartient à l'utilisateur qui le crée", () => {
      const groupe = GroupeServices.nouveau(unUUID('U'), 'Métier');

      expect(groupe.donnees().idUtilisateur).toBe(unUUID('U'));
    });

    it('reçoit un identifiant à sa création', () => {
      const groupe = GroupeServices.nouveau(unUUID('U'), 'API');

      expect(groupe.donnees().id).toBeDefined();
    });

    it('retire les espaces en début et fin de libellé', () => {
      const groupe = GroupeServices.nouveau(unUUID('U'), '   Métier  ');

      expect(groupe.donnees().libelle).toBe('Métier');
    });

    it('refuse un libellé vide ou composé uniquement d’espaces', () => {
      expect(() => GroupeServices.nouveau(unUUID('U'), '')).toThrow(
        ErreurLibelleGroupeServicesInvalide
      );
      expect(() => GroupeServices.nouveau(unUUID('U'), '   ')).toThrow(
        ErreurLibelleGroupeServicesInvalide
      );
    });
  });

  describe('lorsqu’il est renommé', () => {
    it('prend le nouveau libellé, débarrassé de ses espaces superflus', () => {
      const groupe = GroupeServices.nouveau(unUUID('U'), 'Métier');

      groupe.renomme('  Support  ');

      expect(groupe.donnees().libelle).toBe('Support');
    });

    it('refuse un libellé vide', () => {
      const groupe = GroupeServices.nouveau(unUUID('U'), 'Métier');

      expect(() => groupe.renomme('  ')).toThrow(
        ErreurLibelleGroupeServicesInvalide
      );
      expect(groupe.donnees().libelle).toBe('Métier');
    });
  });

  it('peut être reconstitué à partir de ses données', () => {
    const donnees = {
      id: unUUID('C'),
      idUtilisateur: unUUID('U'),
      libelle: 'Service - Web',
      idServicesAssocies: [unUUID('S')],
    };

    const groupe = GroupeServices.hydrate(donnees);

    expect(groupe.donnees()).toEqual(donnees);
  });

  it("se sérialise en JSON avec son identifiant et son libellé, sans l'identifiant de l'utilisateur", () => {
    const groupe = GroupeServices.hydrate({
      id: unUUID('C'),
      idUtilisateur: unUUID('U'),
      libelle: 'Métier',
      idServicesAssocies: [unUUID('S')],
    });

    expect(groupe.toJSON()).toEqual({
      id: unUUID('C'),
      libelle: 'Métier',
      idServicesAssocies: [unUUID('S')],
    });
  });
});
