const expect = require('expect.js');

const DatesTelechargements = require('../../src/modeles/datesTelechargements');

describe('Une étape dates de téléchargements', () => {
  const dateTelechargementAnnexes = '2023-01-01T00:00:00.000Z';
  const dateTelechargementDecision = '2023-02-02T00:00:00.000Z';
  const dateTelechargementSynthese = '2023-03-03T00:00:00.000Z';
  const datesTelechargementsComplete = new DatesTelechargements({
    annexes: dateTelechargementAnnexes,
    decision: dateTelechargementDecision,
    synthese: dateTelechargementSynthese,
  });

  describe('sur demande de conversion en JSON', () => {
    it('sait se convertir en JSON', () => {
      expect(datesTelechargementsComplete.toJSON()).to.eql({
        annexes: dateTelechargementAnnexes,
        decision: dateTelechargementDecision,
        synthese: dateTelechargementSynthese,
      });
    });

    it('exclut les propriétés qui ne sont pas définies', () => {
      const datesTelechargements = new DatesTelechargements({
        annexes: dateTelechargementAnnexes,
      });
      expect(datesTelechargements.toJSON()).to.eql({
        annexes: dateTelechargementAnnexes,
      });
    });
  });

  describe("sur vérification qu'elle est complète", () => {
    it("retourne `false` s'il manque une des dates", () => {
      const datesTelechargements = new DatesTelechargements({
        annexes: dateTelechargementAnnexes,
        decision: dateTelechargementDecision,
      });
      expect(datesTelechargements.estComplete()).to.be(false);
    });

    it('retourne `true` si toutes les dates sont renseignées', () => {
      expect(datesTelechargementsComplete.estComplete()).to.be(true);
    });
  });
});
