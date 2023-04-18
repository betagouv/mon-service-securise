const expect = require('expect.js');
const { genereGradientConique } = require('../../../src/pdf/graphiques/camembert');

describe('Les graphiques camembert', () => {
  describe('quand ils sont générés via un gradient conique', () => {
    it('retournent un angle proportionel à la valeur du statut', () => {
      const statistiques = { enCours: 5, nonFait: 5, fait: 5, restant: 5 };

      expect(genereGradientConique(statistiques)).to.eql({
        angles: {
          enCours: { debut: 0, milieu: 45, fin: 90 },
          nonFait: { debut: 90, milieu: 135, fin: 180 },
          restant: { debut: 180, milieu: 225, fin: 270 },
          fait: { debut: 270, milieu: 315, fin: 360 },
        },
      });
    });

    it("retournent un seul angle valant 360 degrés quand il n'y a qu'un seul statut possédant une valeur", () => {
      const statistiques = { enCours: 0, nonFait: 5, fait: 0, restant: 0 };

      expect(genereGradientConique(statistiques)).to.eql({
        angles: {
          enCours: { debut: 0, milieu: 0, fin: 0 },
          nonFait: { debut: 0, milieu: 180, fin: 360 },
          restant: { debut: 360, milieu: 360, fin: 360 },
          fait: { debut: 360, milieu: 360, fin: 360 },
        },
      });
    });

    it("s'assurent qu'une portion avec valeur fasse au moins 20 degrés pour rester visible", () => {
      const verifieAngleMinimum = (statistiques, identifiantStatut) => {
        const { angles } = genereGradientConique(statistiques);
        const { debut, fin } = angles[identifiantStatut];
        expect(fin - debut).to.equal(20);
      };

      verifieAngleMinimum({ enCours: 1, nonFait: 0, fait: 100, restant: 0 }, 'enCours');
      verifieAngleMinimum({ enCours: 0, nonFait: 1, fait: 100, restant: 0 }, 'nonFait');
      verifieAngleMinimum({ enCours: 0, nonFait: 0, fait: 100, restant: 1 }, 'restant');
      verifieAngleMinimum({ enCours: 0, nonFait: 0, fait: 1, restant: 100 }, 'fait');
    });
  });
});
