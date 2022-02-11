const expect = require('expect.js');

const Hebergement = require('../../../src/modeles/partiesPrenantes/hebergement');

describe('Un hébergement', () => {
  it('sait se décrire en JSON', () => {
    const hebergement = new Hebergement({ nom: 'hébergeur' });
    expect(hebergement.toJSON()).to.eql({ type: 'Hebergement', nom: 'hébergeur' });
  });
});
