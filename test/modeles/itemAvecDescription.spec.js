const expect = require('expect.js');

const ItemAvecDescription = require('../../src/modeles/itemAvecDescription');

describe('Un item avec description', () => {
  it('connaît sa description', () => {
    const itemAvecDescription = new ItemAvecDescription({
      description: 'Une description',
    });

    expect(itemAvecDescription.description).to.equal('Une description');
  });

  it('donne la clé de sa propriété', () => {
    expect(ItemAvecDescription.proprietes()).to.eql(['description']);
  });
});
