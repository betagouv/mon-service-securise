import { verifieProprietesRenseignees } from '../../src/utilitaires/proprietesRequises.ts';
import { ErreurDonneesObligatoiresManquantes } from '../../src/erreurs.js';

describe('La vérification des propriétés requises', () => {
  it('ne lève rien si toutes les propriétés requises sont renseignées', () => {
    expect(() =>
      verifieProprietesRenseignees({ a: 1, b: false, c: '' }, ['a', 'b', 'c'])
    ).not.toThrow();
  });

  it.each([undefined, null])(
    'lève une erreur nommant la propriété requise manquante (refuse `%s`)',
    (valeurManquante) => {
      expect(() =>
        verifieProprietesRenseignees({ a: valeurManquante }, ['a'])
      ).toThrow(
        new ErreurDonneesObligatoiresManquantes('Il manque la donnée a')
      );
    }
  );

  it('lève une erreur si les données elles-mêmes sont absentes', () => {
    expect(() =>
      verifieProprietesRenseignees(undefined as unknown as { a: number }, ['a'])
    ).toThrow(ErreurDonneesObligatoiresManquantes);
  });

  it('ignore les propriétés non requises', () => {
    expect(() =>
      verifieProprietesRenseignees({ a: 1, b: undefined }, ['a'])
    ).not.toThrow();
  });
});
