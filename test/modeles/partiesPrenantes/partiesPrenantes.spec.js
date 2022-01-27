const expect = require('expect.js');

const PartiesPrenantes = require('../../../src/modeles/partiesPrenantes/partiesPrenantes');

const elles = it;

describe('Les parties prenantes', () => {
  elles('savent se décrire en JSON', () => {
    const partiesPrenantes = new PartiesPrenantes(
      { partiesPrenantes: [{ type: 'hebergement', nom: 'hébergeur' }] }
    );

    expect(partiesPrenantes.toJSON()).to.eql([{ type: 'hebergement', nom: 'hébergeur' }]);
  });
});
