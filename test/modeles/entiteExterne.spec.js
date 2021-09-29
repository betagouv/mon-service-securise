const expect = require('expect.js');

const EntiteExterne = require('../../src/modeles/entiteExterne');

describe('Une entité externe', () => {
  it('connaît ses constituants', () => {
    const entite = new EntiteExterne({ nom: 'Un nom', acces: 'Accès administrateur' });
    expect(entite.nom).to.equal('Un nom');
    expect(entite.acces).to.equal('Accès administrateur');
  });
});
