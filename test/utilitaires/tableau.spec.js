const expect = require('expect.js');
const { zipTableaux } = require('../../src/utilitaires/tableau');

describe('Utilitaires sur les tableaux', () => {
  describe('La fonction `zip` entre 2 tableaux', () => {
    it('fusionne les objets des 2 tableaux en se basant sur une propriété donnée', () => {
      const a = [{ id: '1', provientDeA: true }];
      const b = [{ id: '1', provientDeB: true }];

      const zip = zipTableaux(a, b, 'id');

      expect(zip).to.eql([{ id: '1', provientDeA: true, provientDeB: true }]);
    });

    it('ne permet pas le zip de tableaux de longueurs différentes', () => {
      const a = [];
      const b = [{ id: '1', provientDeB: true }];

      expect(() => zipTableaux(a, b, 'id')).to.throwError((e) => {
        expect(e.message).to.be(
          'Impossible de ziper des tableaux de tailles différentes. Ici [0] et [1].'
        );
      });
    });
  });
});
