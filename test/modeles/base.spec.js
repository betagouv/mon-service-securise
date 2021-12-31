const expect = require('expect.js');

const Base = require('../../src/modeles/base');

describe('Un objet métier', () => {
  it('sait si une de ses propriétés a été saisie', () => {
    const objetMetier = new Base({ proprietesAtomiquesRequises: ['propriete'] });
    objetMetier.renseigneProprietes({});
    expect(objetMetier.proprieteSaisie('propriete')).to.be(false);

    objetMetier.renseigneProprietes({ propriete: 'valeur' });
    expect(objetMetier.proprieteSaisie('propriete')).to.be(true);
  });

  it("considère qu'une propriété renseignée à chaîne vide n'est pas saisie", () => {
    const objetMetier = new Base({ proprietesAtomiquesRequises: ['propriete'] });
    objetMetier.renseigneProprietes({ propriete: '' });
    expect(objetMetier.proprieteSaisie('propriete')).to.be(false);
  });

  it('renseigne les propriétés facultatives', () => {
    const objetMetier = new Base({ proprietesAtomiquesFacultatives: ['propriete'] });
    objetMetier.renseigneProprietes({ propriete: 'valeur' });
    expect(objetMetier.propriete).to.equal('valeur');
  });

  it('convertit les proprietes facultatives en JSON', () => {
    const objetMetier = new Base({ proprietesAtomiquesFacultatives: ['propriete'] });
    objetMetier.renseigneProprietes({ propriete: 'valeur' });
    expect(objetMetier.toJSON()).to.eql({ propriete: 'valeur' });
  });
});
