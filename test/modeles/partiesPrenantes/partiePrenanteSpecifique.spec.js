import expect from 'expect.js';
import PartiePrenanteSpecifique from '../../../src/modeles/partiesPrenantes/partiePrenanteSpecifique.js';

describe('Une partie prenante spécifique', () => {
  it('sait se décrire en JSON', () => {
    const partiePrenanteSpecifique = new PartiePrenanteSpecifique({
      nom: 'partie',
    });
    expect(partiePrenanteSpecifique.toJSON()).to.eql({
      type: 'PartiePrenanteSpecifique',
      nom: 'partie',
    });
  });
});
