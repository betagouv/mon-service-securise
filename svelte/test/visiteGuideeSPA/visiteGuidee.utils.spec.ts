import { calculePositionModale } from '../../lib/visiteGuideeSPA/visiteGuidee.utils';

describe('Le calcul de position de la modale explicative', () => {
  const tailleModale = { width: 400, height: 300 };

  describe("quand la modale est positionnée en 'bas'", () => {
    it('centre la modale horizontalement sur la cible', () => {
      const rectCible = { top: 500, left: 100, width: 200, height: 50 };

      const { left } = calculePositionModale(rectCible, tailleModale, 'bas', 0);

      expect(left).toBe(100 + 200 / 2 - 400 / 2);
    });

    it('place le bas de la modale au niveau du haut de la cible, décalé de la valeur demandée', () => {
      const rectCible = { top: 500, left: 100, width: 200, height: 50 };

      const { top } = calculePositionModale(rectCible, tailleModale, 'bas', 14);

      expect(top).toBe(500 - 300 + 14);
    });
  });

  describe("quand la modale est positionnée à 'droite'", () => {
    it('centre la modale verticalement sur la cible', () => {
      const rectCible = { top: 500, left: 600, width: 200, height: 50 };

      const { top } = calculePositionModale(
        rectCible,
        tailleModale,
        'droite',
        0
      );

      expect(top).toBe(500 + 50 / 2 - 300 / 2);
    });

    it('place la modale à gauche de la cible, décalée de la valeur demandée', () => {
      const rectCible = { top: 500, left: 600, width: 200, height: 50 };

      const { left } = calculePositionModale(
        rectCible,
        tailleModale,
        'droite',
        24
      );

      expect(left).toBe(600 - 400 + 24);
    });
  });
});
