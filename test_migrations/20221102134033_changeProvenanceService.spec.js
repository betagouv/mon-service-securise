const expect = require('expect.js');
const {
  developpeProvenance,
  reduitProvenance,
} = require('../migrations/20221102134033_changeProvenanceService');

describe('La migration de la provenance du service depuis valeurs multiple en valeur simple', () => {
  describe("vers l'avant", () => {
    it("laisse la provenance non définie lorsqu'elle l'était déjà", () => {
      expect(reduitProvenance(undefined)).to.be(undefined);
    });

    it("choisit une provenance non définie dès qu'une provenance est inconnue", () => {
      expect(reduitProvenance(['inconnue'])).to.be(undefined);
      expect(reduitProvenance(['achat', 'inconnue'])).to.be(undefined);
    });

    it('choisit une provenance non définie quand le format de la provenance ne convient pas', () => {
      expect(reduitProvenance('achat')).to.be(undefined);
    });

    it("préserve la provenance existante lorsqu'elle est unique", () => {
      expect(reduitProvenance(['achat'])).to.equal('achat');
    });

    it("choisit outil existant lorsqu'il y a plusieurs provenances", () => {
      expect(reduitProvenance(['achat', 'developpement'])).to.equal(
        'outilExistant'
      );
    });
  });

  describe("vers l'arrière", () => {
    it("laisse non définie lorsque la provenance l'était", () => {
      expect(developpeProvenance(undefined)).to.be(undefined);
    });

    it('transforme outil existant en développement et achat', () => {
      expect(developpeProvenance('outilExistant')).to.eql([
        'developpement',
        'achat',
      ]);
    });

    it("préserve la provenance lorsqu'elle est achat ou développement", () => {
      expect(developpeProvenance('achat')).to.eql(['achat']);
      expect(developpeProvenance('developpement')).to.eql(['developpement']);
    });

    it('supprime la provenance non connue', () => {
      expect(developpeProvenance('inconnue')).to.eql([]);
    });
  });
});
