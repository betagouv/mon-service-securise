import EvenementNouvelleConnexionUtilisateur from '../../src/bus/evenementNouvelleConnexionUtilisateur.js';
import { unUUID } from '../constructeurs/UUID.ts';
import { SourceAuthentification } from '../../src/modeles/sourceAuthentification.ts';

describe("L'événement `EvenementNouvelleConnexionUtilisateur", () => {
  const donneesEvenements = () => ({
    idUtilisateur: unUUID('1'),
    dateDerniereConnexion: '2024-03-25',
    source: SourceAuthentification.MSS,
    connexionAvecMFA: false,
  });

  it("lève une exception s'il est instancié sans id utilisateur", () => {
    expect(
      () =>
        new EvenementNouvelleConnexionUtilisateur({
          ...donneesEvenements(),
          // @ts-expect-error On force volontairement la valeur `null` pour déclencher une erreur
          idUtilisateur: null,
        })
    ).toThrowError();
  });

  it("lève une exception s'il est instancié sans date de dernière connexion", () => {
    expect(
      () =>
        new EvenementNouvelleConnexionUtilisateur({
          ...donneesEvenements(),
          // @ts-expect-error On force volontairement la valeur `null` pour déclencher une erreur
          dateDerniereConnexion: null,
        })
    ).toThrowError();
  });

  it("lève une exception s'il est instancié avec une date de dernière connexion qui n'est pas une date", () => {
    expect(
      () =>
        new EvenementNouvelleConnexionUtilisateur({
          ...donneesEvenements(),
          dateDerniereConnexion: 'pasUneDate',
        })
    ).toThrowError();
  });

  it("lève une exception s'il est instancié sans source", () => {
    expect(
      () =>
        new EvenementNouvelleConnexionUtilisateur({
          ...donneesEvenements(),
          // @ts-expect-error On force volontairement la valeur `null` pour déclencher une erreur
          source: null,
        })
    ).toThrowError();
  });

  it("lève une exception s'il est instancié sans connexion avec MFA", () => {
    expect(
      () =>
        new EvenementNouvelleConnexionUtilisateur({
          ...donneesEvenements(),
          // @ts-expect-error On force volontairement la valeur `null` pour déclencher une erreur
          connexionAvecMFA: null,
        })
    ).toThrowError();
  });
});
