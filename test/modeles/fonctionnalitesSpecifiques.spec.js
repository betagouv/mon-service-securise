const expect = require('expect.js');

const FonctionnalitesSpecifiques = require('../../src/modeles/fonctionnalitesSpecifiques');

const elles = it;

describe('Les fonctionnalités spécifiques', () => {
  elles('savent se dénombrer', () => {
    const fonctionnalitesSpecifiques = new FonctionnalitesSpecifiques(
      { fonctionnalitesSpecifiques: [
        { description: 'Une fonctionnalité' },
        { description: 'Une autre fonctionnalité' },
      ] }
    );

    expect(fonctionnalitesSpecifiques.nombre()).to.equal(2);
  });
});
