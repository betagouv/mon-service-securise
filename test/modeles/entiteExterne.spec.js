const expect = require('expect.js');

const EntiteExterne = require('../../src/modeles/entiteExterne');

describe('Une entité externe', () => {
  it('connaît ses constituants', () => {
    const entite = new EntiteExterne({
      nom: 'Un nom',
      contact: 'jean.dupont@mail.fr',
      acces: 'Accès administrateur',
    });

    expect(entite.nom).to.equal('Un nom');
    expect(entite.contact).to.equal('jean.dupont@mail.fr');
    expect(entite.acces).to.equal('Accès administrateur');
  });
});
