import Hebergement from '../../../src/modeles/partiesPrenantes/hebergement.js';

describe('Un hébergement', () => {
  it('sait se décrire en JSON', () => {
    const hebergement = new Hebergement({ nom: 'hébergeur' });
    expect(hebergement.toJSON()).toEqual({
      type: 'Hebergement',
      nom: 'hébergeur',
    });
  });
});
