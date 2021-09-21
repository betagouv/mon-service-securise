const expect = require('expect.js');

const EntitesExternes = require('../../src/modeles/entitesExternes');

const elles = it;

describe('Les entités externes', () => {
  elles('savent se dénombrer', () => {
    const entites = new EntitesExternes({ entitesExternes: [
      { nom: 'Une entité', rôle: 'Un rôle' },
      { nom: 'Une autre entité', rôle: 'Un autre rôle' },
    ] });

    expect(entites.nombre()).to.equal(2);
  });
});
