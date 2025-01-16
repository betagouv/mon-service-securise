const expect = require('expect.js');

const SecuriteService = require('../../../src/modeles/partiesPrenantes/securiteService');

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
