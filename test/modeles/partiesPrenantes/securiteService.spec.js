import expect from 'expect.js';
import SecuriteService from '../../../src/modeles/partiesPrenantes/securiteService.js';

describe('Une sécurité du service', () => {
  it('sait se décrire en JSON', () => {
    const securiteService = new SecuriteService({
      nom: 'Structure supervision',
    });
    expect(securiteService.toJSON()).to.eql({
      type: 'SecuriteService',
      nom: 'Structure supervision',
    });
  });
});
