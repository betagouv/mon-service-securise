const expect = require('expect.js');

const PartiePrenanteSpecifique = require('../../../src/modeles/partiesPrenantes/partiePrenanteSpecifique');

describe('Une partie prenante spécifique', () => {
  it('sait se décrire en JSON', () => {
    const partiePrenanteSpecifique = new PartiePrenanteSpecifique({ nom: 'partie' });
    expect(partiePrenanteSpecifique.toJSON()).to.eql({ type: 'PartiePrenanteSpecifique', nom: 'partie' });
  });
});
