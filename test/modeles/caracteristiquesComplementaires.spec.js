const expect = require('expect.js');

const CaracteristiquesComplementaires = require('../../src/modeles/caracteristiquesComplementaires');
const InformationsHomologation = require('../../src/modeles/informationsHomologation');

describe("L'ensemble des caractéristiques complémentaires", () => {
  describe('sur demande du statut de saisie', () => {
    it('a pour statut COMPLETES', () => {
      const caracteristiques = new CaracteristiquesComplementaires({});

      expect(caracteristiques.statutSaisie()).to.equal(InformationsHomologation.COMPLETES);
    });
  });
});
