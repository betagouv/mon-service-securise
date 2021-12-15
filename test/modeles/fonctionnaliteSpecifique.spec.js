const expect = require('expect.js');

const FonctionnaliteSpecifique = require('../../src/modeles/fonctionnaliteSpecifique');

describe('Une fonctionnalité spécifique', () => {
  it('connaît sa description', () => {
    const fonctionnaliteSpecifique = new FonctionnaliteSpecifique({
      description: 'Une description',
    });

    expect(fonctionnaliteSpecifique.description).to.equal('Une description');
  });

  it('donne la liste des noms de ses propriétés', () => {
    expect(FonctionnaliteSpecifique.proprietes()).to.eql(['description']);
  });
});
