const expect = require('expect.js');

const PartiesPrenantes = require('../../../src/modeles/partiesPrenantes/partiesPrenantes');

const elles = it;

describe('Les parties prenantes', () => {
  elles('savent se décrire en JSON', () => {
    const partiesPrenantes = new PartiesPrenantes(
      { partiesPrenantes: [{ type: 'Hebergement', nom: 'hébergeur' }] }
    );

    expect(partiesPrenantes.toJSON()).to.eql([{ type: 'Hebergement', nom: 'hébergeur' }]);
  });

  elles("savent transmettre l'hébergement", () => {
    const partiesPrenantes = new PartiesPrenantes(
      { partiesPrenantes: [{ type: 'Hebergement', nom: 'hébergeur' }] }
    );

    expect(partiesPrenantes.hebergement()).to.eql({ type: 'Hebergement', nom: 'hébergeur' });
  });

  elles('savent transmettre les informations du développement et fourniture du service', () => {
    const partiesPrenantes = new PartiesPrenantes(
      { partiesPrenantes: [{ type: 'DeveloppementFourniture', nom: 'structure' }] }
    );

    expect(partiesPrenantes.developpementFourniture()).to.eql({ type: 'DeveloppementFourniture', nom: 'structure' });
  });
});
