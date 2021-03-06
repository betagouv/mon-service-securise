const expect = require('expect.js');

const Base = require('../../src/modeles/base');

describe('Un objet métier', () => {
  it('sait si une de ses propriétés a été saisie', () => {
    const objetMetier = new Base(['propriete']);
    objetMetier.renseigneProprietes({});
    expect(objetMetier.proprieteSaisie('propriete')).to.be(false);

    objetMetier.renseigneProprietes({ propriete: 'valeur' });
    expect(objetMetier.proprieteSaisie('propriete')).to.be(true);
  });

  it("considère qu'une propriété renseignée à chaîne vide n'est pas saisie", () => {
    const objetMetier = new Base(['propriete']);

    objetMetier.renseigneProprietes({ propriete: '' });
    expect(objetMetier.proprieteSaisie('propriete')).to.be(false);
  });
});
