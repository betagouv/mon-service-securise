const expect = require('expect.js');

const NatureService = require('../../src/modeles/natureService');

describe('Une nature de service', () => {
  it('sait se décrire', () => {
    const referentiel = { natureService: { api: 'API' } };
    const natureService = new NatureService('api', referentiel);

    expect(natureService.description()).to.equal('API');
  });
});
