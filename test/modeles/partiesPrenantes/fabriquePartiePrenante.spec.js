const expect = require('expect.js');

const { ErreurTypeInconnu } = require('../../../src/erreurs');
const fabriquePartiePrenante = require('../../../src/modeles/partiesPrenantes/fabriquePartiePrenante');
const DeveloppementFourniture = require('../../../src/modeles/partiesPrenantes/developpementFourniture');
const Hebergement = require('../../../src/modeles/partiesPrenantes/hebergement');

describe('La fabrique de partie prenante', () => {
  it('fabrique des hébergements', () => {
    const hebergement = fabriquePartiePrenante.cree({ type: 'Hebergement', nom: 'Un hébergeur' });
    expect(hebergement).to.be.an(Hebergement);
  });

  it('fabrique des développements / fournitures de service', () => {
    const developpementFourniture = fabriquePartiePrenante.cree({ type: 'DeveloppementFourniture', nom: 'Mss' });
    expect(developpementFourniture).to.be.a(DeveloppementFourniture);
  });

  it('retourne une erreur si le type est inconnu', () => {
    expect(
      () => fabriquePartiePrenante.cree({ type: 'inconnu' })
    ).to.throwException((e) => {
      expect(e).to.be.an(ErreurTypeInconnu);
      expect(e.message).to.equal('Le type "inconnu" est inconnu');
    });
  });
});
