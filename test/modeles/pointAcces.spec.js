const expect = require('expect.js');

const PointAcces = require('../../src/modeles/pointAcces');

describe("Un point d'accès", () => {
  it('connaît sa description', () => {
    const pointAcces = new PointAcces({
      description: 'Une description',
    });

    expect(pointAcces.description).to.equal('Une description');
  });

  it('donne la liste des noms de ses propriétés', () => {
    expect(PointAcces.proprietes()).to.eql(['description']);
  });
});
