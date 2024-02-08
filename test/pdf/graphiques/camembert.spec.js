const expect = require('expect.js');
const {
  genereGradientConique,
} = require('../../../src/pdf/graphiques/camembert');

describe('Les graphiques camembert', () => {
  describe('quand ils sont générés via un gradient conique', () => {
    it('retournent un angle proportionel à la valeur du statut', () => {
      const statistiques = {
        enCours: 5,
        nonFait: 5,
        fait: 5,
        aRemplir: 5,
        aLancer: 5,
      };

      expect(genereGradientConique(statistiques)).to.eql({
        angles: {
          enCours: { debut: 0, milieu: 36, fin: 72 },
          nonFait: { debut: 72, milieu: 108, fin: 144 },
          aLancer: { debut: 144, milieu: 180, fin: 216 },
          aRemplir: { debut: 216, milieu: 252, fin: 288 },
          fait: { debut: 288, milieu: 324, fin: 360 },
        },
        unique: null,
      });
    });

    it("retournent un seul angle valant 360 degrés quand il n'y a qu'un seul statut possédant une valeur", () => {
      const statistiques = {
        enCours: 0,
        nonFait: 5,
        fait: 0,
        aRemplir: 0,
        aLancer: 0,
      };

      expect(genereGradientConique(statistiques)).to.eql({
        angles: {
          enCours: { debut: 0, milieu: 0, fin: 0 },
          nonFait: { debut: 0, milieu: 180, fin: 360 },
          aLancer: { debut: 360, milieu: 360, fin: 360 },
          aRemplir: { debut: 360, milieu: 360, fin: 360 },
          fait: { debut: 360, milieu: 360, fin: 360 },
        },
        unique: 'nonFait',
      });
    });

    it("s'assurent qu'une portion avec valeur fasse au moins 30 degrés pour rester visible", () => {
      const verifieAngleMinimum = (statistiques, identifiantStatut) => {
        const { angles } = genereGradientConique(statistiques);
        const { debut, fin } = angles[identifiantStatut];
        expect(fin - debut).to.equal(30);
      };

      verifieAngleMinimum(
        { enCours: 1, nonFait: 0, aLancer: 0, fait: 100, aRemplir: 0 },
        'enCours'
      );
      verifieAngleMinimum(
        { enCours: 0, nonFait: 1, aLancer: 0, fait: 100, aRemplir: 0 },
        'nonFait'
      );
      verifieAngleMinimum(
        { enCours: 0, nonFait: 0, aLancer: 1, fait: 100, aRemplir: 0 },
        'aLancer'
      );
      verifieAngleMinimum(
        { enCours: 0, nonFait: 0, aLancer: 0, fait: 100, aRemplir: 1 },
        'aRemplir'
      );
      verifieAngleMinimum(
        { enCours: 0, nonFait: 0, aLancer: 0, fait: 1, aRemplir: 100 },
        'fait'
      );
    });

    it("s'assurent que les « débuts » et « fins » des angles minimum ne se chevauchent pas", () => {
      const statistiques = {
        enCours: 1,
        nonFait: 1,
        aLancer: 1,
        aRemplir: 1,
        fait: 47,
      };

      const { angles } = genereGradientConique(statistiques);

      const verifieDebutFin = (debut, fin, idStatut) => {
        expect(angles[idStatut].debut).to.equal(debut);
        expect(angles[idStatut].fin).to.equal(fin);
      };

      verifieDebutFin(0, 30, 'enCours');
      verifieDebutFin(30, 60, 'nonFait');
      verifieDebutFin(60, 90, 'aLancer');
      verifieDebutFin(90, 120, 'aRemplir');
    });

    it("s'assurent de ne pas dépasser 360 degrés, même en cas d'utilisation d'angle(s) minimum(s) au début du camembert", () => {
      const statistiques = {
        enCours: 1,
        nonFait: 1,
        aLancer: 1,
        aRemplir: 1,
        fait: 47,
      };

      expect(genereGradientConique(statistiques)).to.eql({
        angles: {
          enCours: { debut: 0, milieu: 15, fin: 30 },
          nonFait: { debut: 30, milieu: 45, fin: 60 },
          aLancer: { debut: 60, milieu: 75, fin: 90 },
          aRemplir: { debut: 90, milieu: 105, fin: 120 },
          fait: { debut: 120, milieu: 240, fin: 360 },
        },
        unique: null,
      });
    });

    it("s'assurent de ne pas dépasser 360 degrés, même en cas d'utilisation d'angle(s) minimum(s) à la fin du camembert", () => {
      const statistiques = {
        enCours: 47,
        nonFait: 1,
        aLancer: 1,
        aRemplir: 1,
        fait: 1,
      };

      expect(genereGradientConique(statistiques)).to.eql({
        angles: {
          enCours: { debut: 0, milieu: 120, fin: 240 },
          nonFait: { debut: 240, milieu: 255, fin: 270 },
          aLancer: { debut: 270, milieu: 285, fin: 300 },
          aRemplir: { debut: 300, milieu: 315, fin: 330 },
          fait: { debut: 330, milieu: 345, fin: 360 },
        },
        unique: null,
      });
    });

    it("s'assurent que le champs 'unique' est null si il y a au moins 2 portions non nulles", () => {
      const statistiques = {
        enCours: 1,
        nonFait: 1,
        aLancer: 0,
        aRemplir: 0,
        fait: 0,
      };

      expect(genereGradientConique(statistiques).unique).to.equal(null);
    });

    it("s'assurent que le champs 'unique' porte la clé de la portion si une seule portion est présente", () => {
      const statistiques = {
        enCours: 1,
        nonFait: 0,
        aLancer: 0,
        aRemplir: 0,
        fait: 0,
      };

      expect(genereGradientConique(statistiques).unique).to.equal('enCours');
    });
  });
});
