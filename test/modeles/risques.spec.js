const expect = require('expect.js');

const Risques = require('../../src/modeles/risques');
const RisquesSpecifiques = require('../../src/modeles/risquesSpecifiques');

const ils = it;

describe('Les risques liés à une homologation', () => {
  ils('agrègent des risques spécifiques', () => {
    const risques = new Risques({ risquesSpecifiques: [
      { description: 'Un risque spécifique', commentaire: 'Un commentaire' },
    ] });

    expect(risques.risquesSpecifiques).to.be.a(RisquesSpecifiques);
  });

  describe('sur demande du statut de saisie', () => {
    ils("retournent `A_SAISIR` s'il n'y a encore eu aucune vérification", () => {
      const risques = new Risques({ risquesVerifies: false });
      expect(risques.statutSaisie()).to.equal(Risques.A_SAISIR);
    });

    describe('quand les risques ont été vérifiés', () => {
      ils('retournent `COMPLETES`si tous les risques spécifiques saisis ont une description', () => {
        const risques = new Risques({
          risquesVerifies: true,
          risquesSpecifiques: [{ description: 'Un risque spécifique' }],
        });

        expect(risques.statutSaisie()).to.equal(Risques.COMPLETES);
      });

      ils("retournent `A_COMPLETER` si au moins un risque spécifique n'a pas de description", () => {
        const risques = new Risques({
          risquesVerifies: true,
          risquesSpecifiques: [{ commentaire: 'Un commentaire sans description' }],
        });

        expect(risques.statutSaisie()).to.equal(Risques.A_COMPLETER);
      });
    });
  });
});
