import expect from 'expect.js';
import Hebergement from '../../../src/modeles/partiesPrenantes/hebergement.js';

describe('Un hébergement', () => {
  it('sait se décrire en JSON', () => {
    const hebergement = new Hebergement({ nom: 'hébergeur' });
    expect(hebergement.toJSON()).to.eql({
      type: 'Hebergement',
      nom: 'hébergeur',
    });
  });
});
