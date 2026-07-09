import SecuriteService from '../../../src/modeles/partiesPrenantes/securiteService.js';

describe('Une sécurité du service', () => {
  it('sait se décrire en JSON', () => {
    const securiteService = new SecuriteService({
      nom: 'Structure supervision',
    });
    expect(securiteService.toJSON()).toEqual({
      type: 'SecuriteService',
      nom: 'Structure supervision',
    });
  });
});
