const expect = require('expect.js');

const DonneesSensiblesSpecifiques = require('../../src/modeles/donneesSensiblesSpecifiques');

const elles = it;

describe('Les donnees sensibles spécifiques', () => {
  elles("se construisent avec le bon nom d'item", () => {
    const donneesSensiblesSpecifiques = new DonneesSensiblesSpecifiques({
      donneesSensiblesSpecifiques: [],
    });

    expect(donneesSensiblesSpecifiques.nombre()).to.equal(0);
  });
});
