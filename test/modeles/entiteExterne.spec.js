const expect = require('expect.js');

const EntiteExterne = require('../../src/modeles/entiteExterne');

describe('Une entité externe', () => {
  it('connaît ses constituants', () => {
    const entite = new EntiteExterne({ nom: 'Un nom', role: 'Un rôle' });
    expect(entite.nom).to.equal('Un nom');
    expect(entite.role).to.equal('Un rôle');
  });
});
