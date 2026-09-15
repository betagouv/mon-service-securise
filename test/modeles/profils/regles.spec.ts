import Regle from '../../../src/modeles/profils/regle.js';
import Regles from '../../../src/modeles/profils/regles.js';

describe('Les règles', () => {
  it('savent si elles sont vides', () => {
    expect(new Regles([]).sontVides()).toBe(true);
  });

  it('savent si elles sont multiples', () => {
    expect(
      new Regles([
        { presence: ['achat'] },
        { presence: ['banque'] },
      ]).sontMultiples()
    ).toBe(true);
  });

  it('savent si elles ne sont pas multiples', () => {
    expect(new Regles([{ presence: ['achat'] }]).sontMultiples()).toBe(false);
  });

  it('peuvent renvoyer une liste de toutes les règles', () => {
    expect(new Regles([{ presence: ['achat'] }]).toutes()).toEqual([
      new Regle({ presence: ['achat'] }),
    ]);
  });
});
