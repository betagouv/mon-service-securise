const expect = require('expect.js');

const { estHebergement } = require('../../../src/modeles/partiesPrenantes/typePartiePrenante');
const Hebergement = require('../../../src/modeles/partiesPrenantes/hebergement');
const PartiePrenante = require('../../../src/modeles/partiesPrenantes/partiePrenante');

describe('Le type de partie prenante', () => {
  it('renseigne si une partie prenante est un hébergement', () => {
    const partiePrenante = new Hebergement({ nom: 'hébergeur' });
    expect(estHebergement(partiePrenante)).to.be(true);
  });

  it("renseigne si une partie prenante n'est pas un hébergement", () => {
    const partiePrenante = new PartiePrenante({ nom: 'nom' });
    expect(estHebergement(partiePrenante)).to.be(false);
  });
});
