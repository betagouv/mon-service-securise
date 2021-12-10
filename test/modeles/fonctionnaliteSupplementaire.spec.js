const expect = require('expect.js');

const FonctionnaliteSupplementaire = require('../../src/modeles/fonctionnaliteSupplementaire');

describe('Une fonctionnalité supplémentaire', () => {
  it('connaît sa description', () => {
    const fonctionnaliteSupplementaire = new FonctionnaliteSupplementaire({
      description: 'Une description',
    });

    expect(fonctionnaliteSupplementaire.description).to.equal('Une description');
  });

  it('donne la liste des noms de ses propriétés', () => {
    expect(FonctionnaliteSupplementaire.proprietes()).to.eql(['description']);
  });
});
