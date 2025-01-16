const expect = require('expect.js');

const Regle = require('../../../src/modeles/profils/regle');
const Regles = require('../../../src/modeles/profils/regles');

describe('Les règles', () => {
  it('savent si elles sont vides', () => {
    expect(new Regles([]).sontVides()).to.be(true);
  });

  it('savent si elles sont multiples', () => {
    expect(
      new Regles([
        { presence: ['cle'] },
        { presence: ['cleDeux'] },
      ]).sontMultiples()
    ).to.be(true);
  });

  it('savent si elles ne sont pas multiples', () => {
    expect(new Regles([{ presence: ['cle'] }]).sontMultiples()).to.be(false);
  });

  it('peuvent renvoyer une liste de toutes les règles', () => {
    expect(new Regles([{ presence: ['cle'] }]).toutes()).to.eql([
      new Regle({ presence: ['cle'] }),
    ]);
  });
});
