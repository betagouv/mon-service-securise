const expect = require('expect.js');

const { miseEnForme, miseEnFormeLatex } = require('../../src/latex/miseEnFormeDonnees');

describe('La mise en forme de données', () => {
  describe('pour le LaTeX', () => {
    it('décode les caractères html', () => {
      expect(miseEnFormeLatex('l&#39;orage est proche')).to.equal("l'orage est proche");
    });
  });

  describe("sur une demande de mise en forme d'un objet", () => {
    it("met en forme directement quand l'objet est un chaîne de caractères", () => {
      const operation = (texte) => texte.replaceAll('#', '');

      expect(miseEnForme(operation)('Texte avec ##croisillons')).to.equal('Texte avec croisillons');
    });

    it("met en forme les valeurs des propriétés de l'objet quand elles sont des chaînes de caractères", () => {
      const operation = (texte) => texte.replaceAll('#', '');

      expect(miseEnForme(operation)({ clef: '##croisillons' })).to.eql({ clef: 'croisillons' });
    });

    it("met en forme les valeurs des propriétés enfouies de l'objet quand elles sont des chaînes de caractères", () => {
      const operation = (texte) => texte.replaceAll('#', '');

      expect(miseEnForme(operation)({ clef: { clef2: '##croisillons' } })).to.eql({ clef: { clef2: 'croisillons' } });
    });

    it("met en forme les valeurs des collections de l'objet quand elles sont composées de chaînes de caractères", () => {
      const operation = (texte) => texte.replaceAll('#', '');

      expect(miseEnForme(operation)({ clef: ['##croisillons', '#@#'] })).to.eql({ clef: ['croisillons', '@'] });
    });

    it("reste robuste quand des valeurs dans l'objet ne sont pas des chaînes de caractères", () => {
      const operation = (texte) => texte.replaceAll('#', '');

      expect(miseEnForme(operation)({ clef: 12 })).to.eql({ clef: 12 });
      expect(miseEnForme(operation)(undefined)).to.equal(undefined);
      expect(miseEnForme(operation)(null)).to.equal(null);
    });
  });
});
