import { zipTableaux } from '../../src/utilitaires/tableau.js';

describe('Utilitaires sur les tableaux', () => {
  describe('La fonction `zip` entre 2 tableaux', () => {
    it('fusionne les objets des 2 tableaux en se basant sur une propriété donnée', () => {
      const a = [{ id: '1', provientDeA: true }];
      const b = [{ id: '1', provientDeB: true }];

      const zip = zipTableaux(a, b, 'id');

      expect(zip).toEqual([{ id: '1', provientDeA: true, provientDeB: true }]);
    });

    it('ne permet pas le zip de tableaux de longueurs différentes', () => {
      const a: Array<Record<string, unknown>> = [];
      const b = [{ id: '1', provientDeB: true }];

      expect(() => zipTableaux(a, b, 'id')).toThrowError(
        'Impossible de ziper des tableaux de tailles différentes. Ici [0] et [1].'
      );
    });
  });
});
