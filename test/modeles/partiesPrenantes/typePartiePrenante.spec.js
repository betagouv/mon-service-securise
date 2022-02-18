const expect = require('expect.js');

const { estDeveloppementFourniture, estHebergement, estSpecifique } = require('../../../src/modeles/partiesPrenantes/typePartiePrenante');
const DeveloppementFourniture = require('../../../src/modeles/partiesPrenantes/developpementFourniture');
const Hebergement = require('../../../src/modeles/partiesPrenantes/hebergement');
const PartiePrenante = require('../../../src/modeles/partiesPrenantes/partiePrenante');
const PartiePrenanteSpecifique = require('../../../src/modeles/partiesPrenantes/partiePrenanteSpecifique');

describe('Le type de partie prenante', () => {
  it('renseigne si une partie prenante est un hébergement', () => {
    const partiePrenante = new Hebergement({ nom: 'hébergeur' });
    expect(estHebergement(partiePrenante)).to.be(true);
  });

  it("renseigne si une partie prenante n'est pas un hébergement", () => {
    const partiePrenante = new PartiePrenante({ nom: 'nom' });
    expect(estHebergement(partiePrenante)).to.be(false);
  });

  it('renseigne si une partie prenante est de type développement fourniture', () => {
    const partiePrenante = new DeveloppementFourniture({ nom: 'structure' });
    expect(estDeveloppementFourniture(partiePrenante)).to.be(true);
  });

  it("renseigne si une partie prenante n'est pas de type développement fourniture", () => {
    const partiePrenante = new PartiePrenante({ nom: 'nom' });
    expect(estDeveloppementFourniture(partiePrenante)).to.be(false);
  });

  it('renseigne si une partie prenante est une spécifique', () => {
    const partiePrenante = new PartiePrenanteSpecifique({ nom: 'une partie' });
    expect(estSpecifique(partiePrenante)).to.be(true);
  });

  it("renseigne si une partie prenante n'est pas une spécifique", () => {
    const partiePrenante = new PartiePrenante({ nom: 'nom' });
    expect(estSpecifique(partiePrenante)).to.be(false);
  });
});
