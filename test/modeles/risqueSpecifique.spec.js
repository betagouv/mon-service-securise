const expect = require('expect.js');

const RisqueSpecifique = require('../../src/modeles/risqueSpecifique');

describe('Un risque spécifique', () => {
  it('sait se décrire', () => {
    const risque = new RisqueSpecifique({ description: 'Un risque', commentaire: 'Un commentaire' });

    expect(risque.description).to.equal('Un risque');
    expect(risque.commentaire).to.equal('Un commentaire');
  });
});
