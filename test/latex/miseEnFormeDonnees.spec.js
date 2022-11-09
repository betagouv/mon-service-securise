const expect = require('expect.js');

const { decodeCaracteresHtml, echappeCaracteresSpeciauxLatex, miseEnForme } = require('../../src/latex/miseEnFormeDonnees');

describe('La mise en forme de données', () => {
  it('décode les caractères html', () => {
    expect(decodeCaracteresHtml('l&#39;orage est proche')).to.equal("l'orage est proche");
  });

  it('échappe les caractères spéciaux latex', () => {
    expect(echappeCaracteresSpeciauxLatex("Les glaces Ben & Jerry's")).to.equal("Les glaces Ben \\& Jerry's");
  });

  describe("sur une demande de mise en forme d'un objet", () => {
    it("mets en forme directement quand l'objet est un chaîne de caractères", () => {
      const operation = (texte) => texte.replaceAll('#', '');

      expect(miseEnForme(operation)('Texte avec ##croisillons')).to.equal('Texte avec croisillons');
    });

    it("mets en forme les valeurs des propriétés de l'objet quand elles sont des chaînes de caractères", () => {
      const operation = (texte) => texte.replaceAll('#', '');

      expect(miseEnForme(operation)({ clef: '##croisillons' })).to.eql({ clef: 'croisillons' });
    });

    it("mets en forme les valeurs des propriétés enfouies de l'objet quand elles sont des chaînes de caractères", () => {
      const operation = (texte) => texte.replaceAll('#', '');

      expect(miseEnForme(operation)({ clef: { clef2: '##croisillons' } })).to.eql({ clef: { clef2: 'croisillons' } });
    });

    it("mets en forme les valeurs des collections de l'objet quand elles sont composées de chaînes de caractères", () => {
      const operation = (texte) => texte.replaceAll('#', '');

      expect(miseEnForme(operation)({ clef: ['##croisillons', '#@#'] })).to.eql({ clef: ['croisillons', '@'] });
    });

    it("reste robuste quand des valeurs dans l'objet ne sont pas des chaînes de caractères", () => {
      const operation = (texte) => texte.replaceAll('#', '');

      expect(miseEnForme(operation)({ clef: 12 })).to.eql({ clef: 12 });
      expect(miseEnForme(operation)(undefined)).to.equal(undefined);
      expect(miseEnForme(operation)(null)).to.equal(null);
    });

    it('permet de faire plusieurs opérations', () => {
      const operation1 = (texte) => texte.replaceAll('#', '');
      const operation2 = (texte) => texte.replaceAll('__', '--');

      expect(miseEnForme(operation1, operation2)({ clef: ['##croisillons', '__TEXTE__'] })).to.eql({ clef: ['croisillons', '--TEXTE--'] });
    });
  });
});
