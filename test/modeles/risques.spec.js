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
});
