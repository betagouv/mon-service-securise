const expect = require('expect.js');

const Evenement = require('../../../src/modeles/journalMSS/evenement');

describe('Un événement du journal MSS', () => {
  it('sait se convertir en JSON', () => {
    const evenement = new Evenement('TEST_EXECUTE', '17/11/2022');

    expect(evenement.toJSON()).to.eql({ type: 'TEST_EXECUTE', date: '17/11/2022' });
  });
});
