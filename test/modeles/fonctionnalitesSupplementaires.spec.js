const expect = require('expect.js');

const FonctionnalitesSupplementaires = require('../../src/modeles/fonctionnalitesSupplementaires');

const elles = it;

describe('Les fonctionnalités supplémentaires', () => {
  elles('savent se dénombrer', () => {
    const fonctionnalitesSupplementaires = new FonctionnalitesSupplementaires(
      { fonctionnalitesSupplementaires: [
        { description: 'Une fonctionnalité' },
        { description: 'Une autre fonctionnalité' },
      ] }
    );

    expect(fonctionnalitesSupplementaires.nombre()).to.equal(2);
  });
});
