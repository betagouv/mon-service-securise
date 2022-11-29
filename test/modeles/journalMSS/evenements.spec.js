const expect = require('expect.js');
const { EvenementNouveauServiceCree } = require('../../../src/modeles/journalMSS/evenements');

describe('Un événement de nouveau service créé', () => {
  it('sait se convertir en JSON', () => {
    const evenement = new EvenementNouveauServiceCree('17/11/2022');

    expect(evenement.toJSON()).to.eql({ type: 'NOUVEAU_SERVICE_CREE', date: '17/11/2022' });
  });
});
