const expect = require('expect.js');

const FonctionnalitesSpecifiques = require('../../src/modeles/fonctionnalitesSpecifiques');

const elles = it;

describe('Les fonctionnalités spécifiques', () => {
  elles("se construisent avec le bon nom d'item", () => {
    const fonctionnalitesSpecifiques = new FonctionnalitesSpecifiques(
      { fonctionnalitesSpecifiques: [] }
    );

    expect(fonctionnalitesSpecifiques.nombre()).to.equal(0);
  });
});
