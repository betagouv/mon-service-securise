const expect = require('expect.js');
const { EvenementNouvelleHomologationCreee } = require('../../../src/modeles/journalMSS/evenements');

describe('Un événement de nouvelle homologation créée', () => {
  it('sait se convertir en JSON', () => {
    const evenement = new EvenementNouvelleHomologationCreee('17/11/2022');

    expect(evenement.toJSON()).to.eql({ type: 'NOUVELLE_HOMOLOGATION_CREEE', date: '17/11/2022' });
  });
});
