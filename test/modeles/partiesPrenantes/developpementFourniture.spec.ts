import DeveloppementFourniture from '../../../src/modeles/partiesPrenantes/developpementFourniture.js';

describe('Un développement / fourniture', () => {
  it('sait se décrire en JSON', () => {
    const developpementFourniture = new DeveloppementFourniture({ nom: 'Mss' });
    expect(developpementFourniture.toJSON()).toEqual({
      type: 'DeveloppementFourniture',
      nom: 'Mss',
    });
  });
});
