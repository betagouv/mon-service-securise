import ItemsAvecDescription from '../../src/modeles/itemsAvecDescription.js';

describe('Les items avec descriptions', () => {
  it('savent se dénombrer', () => {
    const itemsAvecDescription = new ItemsAvecDescription({
      items: [
        { description: 'Une description' },
        { description: 'Une autre description' },
      ],
    });
    expect(itemsAvecDescription.nombre()).toEqual(2);
  });

  it('savent transmettre leurs descriptions', () => {
    const itemsAvecDescription = new ItemsAvecDescription({
      items: [
        { description: 'Une description' },
        { description: 'Une autre description' },
      ],
    });
    expect(itemsAvecDescription.descriptions()).toEqual([
      'Une description',
      'Une autre description',
    ]);
  });

  it("donnent la liste des propriétés de l'item", () => {
    expect(ItemsAvecDescription.proprietesItem()).toEqual(['description']);
  });
});
