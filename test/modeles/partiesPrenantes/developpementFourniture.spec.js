const expect = require('expect.js');

const DeveloppementFourniture = require('../../../src/modeles/partiesPrenantes/developpementFourniture');

describe('Un développement / fourniture', () => {
  it('sait se décrire en JSON', () => {
    const developpementFourniture = new DeveloppementFourniture({ nom: 'Mss' });
    expect(developpementFourniture.toJSON()).to.eql({ type: 'DeveloppementFourniture', nom: 'Mss' });
  });
});
