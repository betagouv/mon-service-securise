const expect = require('expect.js');

const EntitesExternes = require('../../src/modeles/entitesExternes');

const elles = it;

describe('Les entités externes', () => {
  elles('savent se dénombrer', () => {
    const entites = new EntitesExternes({ entitesExternes: [
      { nom: 'Une entité', acces: 'Un accès' },
      { nom: 'Une autre entité', acces: 'Un autre accès' },
    ] });

    expect(entites.nombre()).to.equal(2);
  });
});
