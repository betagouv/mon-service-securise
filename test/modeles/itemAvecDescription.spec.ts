import ItemAvecDescription from '../../src/modeles/itemAvecDescription.js';

describe('Un item avec description', () => {
  it('connaît sa description', () => {
    const itemAvecDescription = new ItemAvecDescription({
      description: 'Une description',
    });

    expect(itemAvecDescription.description).toEqual('Une description');
  });

  it('donne la clé de sa propriété', () => {
    expect(ItemAvecDescription.proprietes()).toEqual(['description']);
  });
});
