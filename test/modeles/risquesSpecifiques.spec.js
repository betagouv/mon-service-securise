const expect = require('expect.js');

const RisqueSpecifique = require('../../src/modeles/risqueSpecifique');
const RisquesSpecifiques = require('../../src/modeles/risquesSpecifiques');

describe('La liste des risques spécifiques', () => {
  it('sait se dénombrer', () => {
    const risques = new RisquesSpecifiques({ risquesSpecifiques: [] });
    expect(risques.nombre()).to.equal(0);
  });

  it('est composée de risques spécifiques', () => {
    const risques = new RisquesSpecifiques({ risquesSpecifiques: [
      { description: 'Un risque spécifique', commentaire: 'Un commentaire' },
    ] });

    expect(risques.item(0)).to.be.a(RisqueSpecifique);
  });
});
